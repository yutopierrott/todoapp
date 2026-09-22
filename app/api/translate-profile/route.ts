import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildTranslateSystemPrompt } from "@/lib/prompt";
import type { ProfileFields } from "@/lib/profile";

export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 1000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "サーバーにANTHROPIC_API_KEYが設定されていません。" },
      { status: 500 }
    );
  }

  let body: Partial<Record<keyof ProfileFields, unknown>>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const fields: ProfileFields = {
    career: typeof body.career === "string" ? body.career.slice(0, MAX_FIELD_LENGTH) : "",
    hobbies: typeof body.hobbies === "string" ? body.hobbies.slice(0, MAX_FIELD_LENGTH) : "",
    job: typeof body.job === "string" ? body.job.slice(0, MAX_FIELD_LENGTH) : "",
    struggles:
      typeof body.struggles === "string" ? body.struggles.slice(0, MAX_FIELD_LENGTH) : "",
  };

  if (!fields.career && !fields.hobbies && !fields.job && !fields.struggles) {
    return NextResponse.json({ error: "少なくとも1つの項目を入力してください。" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 600,
      system: buildTranslateSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `career: ${fields.career}\nhobbies: ${fields.hobbies}\njob: ${fields.job}\nstruggles: ${fields.struggles}`,
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    let parsed: Partial<ProfileFields>;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Failed to parse translate response:", text);
      return NextResponse.json({ error: "翻訳結果の解析に失敗しました。" }, { status: 502 });
    }

    return NextResponse.json({
      career: parsed.career ?? "",
      hobbies: parsed.hobbies ?? "",
      job: parsed.job ?? "",
      struggles: parsed.struggles ?? "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI翻訳に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 }
    );
  }
}
