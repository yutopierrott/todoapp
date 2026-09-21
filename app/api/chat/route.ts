import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/prompt";
import type { ProfileFields } from "@/lib/profile";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 60;
const MAX_MESSAGE_LENGTH = 2000;

function isProfileFields(value: unknown): value is ProfileFields {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.career === "string" &&
    typeof v.hobbies === "string" &&
    typeof v.job === "string" &&
    typeof v.struggles === "string"
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "サーバーにANTHROPIC_API_KEYが設定されていません。" },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[]; profile?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const { messages, profile } = body;

  if (!isProfileFields(profile)) {
    return NextResponse.json({ error: "プロフィールが必要です。" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messagesが必要です。" }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: "会話が長くなりすぎました。会話をリセットしてください。" },
      { status: 400 }
    );
  }
  for (const m of messages) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length === 0 ||
      m.content.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json({ error: "メッセージの形式が不正です。" }, { status: 400 });
    }
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system: buildSystemPrompt(profile),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AIからの応答取得に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 }
    );
  }
}
