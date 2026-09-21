"use client";

import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/profile";
import { parseAssistantReply } from "@/lib/parseReply";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
  jaDraft?: string;
  enAttempt?: string;
};

const KICKOFF_CONTENT =
  "(Please start our conversation now. Ask me one natural, specific opening question in English based on my profile above. Respond in the required format, leaving MODEL_ANSWER empty.)";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildUserContent(jaDraft: string, enAttempt: string): string {
  const lines: string[] = [];
  if (jaDraft.trim()) lines.push(`日本語で言いたいこと: ${jaDraft.trim()}`);
  lines.push(`英語で書いてみた: ${enAttempt.trim()}`);
  return lines.join("\n");
}

type Props = {
  profile: Profile;
  onEditProfile: () => void;
};

export default function Conversation({ profile, onEditProfile }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [jaDraft, setJaDraft] = useState("");
  const [enAttempt, setEnAttempt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const enInputRef = useRef<HTMLInputElement>(null);
  const startedForProfile = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const callChat = async (history: Message[]) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: profile.en,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "エラーが発生しました。");
    return data.reply as string;
  };

  const startConversation = async () => {
    setIsSending(true);
    setError(null);
    const kickoff: Message = {
      id: createId(),
      role: "user",
      content: KICKOFF_CONTENT,
      hidden: true,
    };
    try {
      const reply = await callChat([kickoff]);
      setMessages([kickoff, { id: createId(), role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました。");
      setMessages([kickoff]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const key = JSON.stringify(profile.en);
    if (startedForProfile.current === key) return;
    startedForProfile.current = key;
    startConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const resetConversation = () => {
    setMessages([]);
    setError(null);
    setJaDraft("");
    setEnAttempt("");
    startConversation();
  };

  const sendMessage = async () => {
    const en = enAttempt.trim();
    if (!en || isSending) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: buildUserContent(jaDraft, en),
      jaDraft: jaDraft.trim() || undefined,
      enAttempt: en,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setJaDraft("");
    setEnAttempt("");
    setError(null);
    setIsSending(true);

    try {
      const reply = await callChat(nextMessages);
      setMessages((prev) => [...prev, { id: createId(), role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました。");
    } finally {
      setIsSending(false);
      enInputRef.current?.focus();
    }
  };

  const visibleMessages = messages.filter((m) => !m.hidden);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="flex h-[85vh] w-full max-w-md flex-col rounded-2xl border border-neutral-200/70 bg-white/80 shadow-xl shadow-neutral-900/5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
        <header className="flex items-center justify-between gap-2 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              英会話パートナー
            </h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              あなたの話題でAIと会話練習
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEditProfile}
              aria-label="プロフィールを編集"
              title="プロフィールを編集"
              className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path
                  d="M13.5 3.5l3 3L6 17l-3.5 0.5L3 14 13.5 3.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={resetConversation}
              aria-label="会話をリセット"
              title="会話をリセット"
              className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path
                  d="M4 4v4h4M16 16v-4h-4M4.5 12a6 6 0 0010.9 3.2M15.5 8A6 6 0 004.6 4.8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {visibleMessages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex animate-fade-in justify-end">
                  <div className="max-w-[80%] space-y-1 rounded-2xl rounded-br-sm bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-white">
                    {m.jaDraft && <div className="text-xs text-white/70">🗣 {m.jaDraft}</div>}
                    <div className="whitespace-pre-wrap">{m.enAttempt ?? m.content}</div>
                  </div>
                </div>
              );
            }

            const { modelAnswer, reply } = parseAssistantReply(m.content);
            return (
              <div key={m.id} className="flex animate-fade-in flex-col items-start gap-1.5">
                {modelAnswer && (
                  <div className="max-w-[85%] rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-sm text-neutral-800 dark:border-accent/30 dark:bg-accent/10 dark:text-neutral-100">
                    <div className="mb-0.5 text-[11px] font-semibold text-accent">
                      ✅ 模範解答
                    </div>
                    <div className="whitespace-pre-wrap">{modelAnswer}</div>
                  </div>
                )}
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-neutral-100 px-3.5 py-2.5 text-sm leading-relaxed text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                  {reply}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
                <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-neutral-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-neutral-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-neutral-400" />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2 border-t border-neutral-100 p-3 dark:border-neutral-800">
          <input
            type="text"
            value={jaDraft}
            onChange={(e) => setJaDraft(e.target.value)}
            placeholder="① 言いたいことを日本語で(任意)"
            disabled={isSending}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <div className="flex gap-2">
            <input
              ref={enInputRef}
              type="text"
              value={enAttempt}
              onChange={(e) => setEnAttempt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="② それを英語で書いてみる"
              disabled={isSending}
              className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <button
              onClick={sendMessage}
              disabled={!enAttempt.trim() || isSending}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
