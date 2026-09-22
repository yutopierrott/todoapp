"use client";

import { useState } from "react";
import type { Profile, ProfileFields } from "@/lib/profile";

const EMPTY: ProfileFields = { career: "", hobbies: "", job: "", struggles: "" };

const FIELD_META: { key: keyof ProfileFields; label: string; placeholder: string }[] = [
  {
    key: "career",
    label: "これまでの経歴",
    placeholder: "例: 大学で経済学を学んだ後、IT企業で5年間営業をしています。",
  },
  {
    key: "hobbies",
    label: "趣味",
    placeholder: "例: 週末にキャンプに行くのが好きです。最近は料理にも興味があります。",
  },
  {
    key: "job",
    label: "今の仕事",
    placeholder: "例: 中小企業向けにSaaSを提案する営業をしています。",
  },
  {
    key: "struggles",
    label: "仕事で困っていること",
    placeholder: "例: 海外クライアントとの英語での商談にまだ自信が持てません。",
  },
];

type Props = {
  initial?: ProfileFields;
  onComplete: (profile: Profile) => void;
  onCancel?: () => void;
};

export default function ProfileSetup({ initial, onComplete, onCancel }: Props) {
  const [ja, setJa] = useState<ProfileFields>(initial ?? EMPTY);
  const [en, setEn] = useState<ProfileFields | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAnyInput = Object.values(ja).some((v) => v.trim().length > 0);

  const translate = async () => {
    if (!hasAnyInput) {
      setError("少なくとも1つの項目を入力してください。");
      return;
    }
    setError(null);
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ja),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "翻訳に失敗しました。");
        return;
      }
      setEn({
        career: data.career ?? "",
        hobbies: data.hobbies ?? "",
        job: data.job ?? "",
        struggles: data.struggles ?? "",
      });
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setIsTranslating(false);
    }
  };

  const confirm = () => {
    if (!en) return;
    onComplete({ ja, en });
  };

  if (en) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200/70 bg-white/80 p-6 shadow-xl shadow-neutral-900/5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            英語に翻訳しました
          </h1>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            内容を確認・修正してから会話を始めましょう。
          </p>

          <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            {FIELD_META.map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {label}
                </label>
                <textarea
                  value={en[key]}
                  onChange={(e) => setEn({ ...en, [key]: e.target.value })}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setEn(null)}
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              日本語に戻って修正
            </button>
            <button
              onClick={confirm}
              className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
            >
              この内容で会話を始める
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/70 bg-white/80 p-6 shadow-xl shadow-neutral-900/5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
          プロフィールを入力
        </h1>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          日本語でOKです。この内容をもとにAIが英語で会話してくれます。
        </p>

        <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pr-1">
          {FIELD_META.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {label}
              </label>
              <textarea
                value={ja[key]}
                onChange={(e) => setJa({ ...ja, [key]: e.target.value })}
                placeholder={placeholder}
                rows={2}
                className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              キャンセル
            </button>
          )}
          <button
            onClick={translate}
            disabled={isTranslating}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTranslating ? "翻訳中..." : "英語に変換する"}
          </button>
        </div>
      </div>
    </main>
  );
}
