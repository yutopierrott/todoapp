# 英会話パートナー

Next.js (App Router) + TypeScript + Tailwind CSS で作った、自分自身の経歴・趣味・仕事について英語で会話練習できるアプリです。
Anthropic API (Claude) を使って会話します。

## 使い方の流れ

1. **プロフィール入力**: 経歴・趣味・今の仕事・仕事で困っていることを日本語で入力
2. **英語に変換**: AIが自然な英語に翻訳。内容を確認・修正して会話開始
3. **会話練習**: AIがプロフィールの内容をもとに質問してくる。各ターンで
   - ① 言いたいことを日本語で入力(任意)
   - ② それを自分で英語にしてみる
   - ③ 送信するとAIが「✅ 模範解答」(日本語の内容を踏まえた自然な英語)と、会話を続ける返答を返す

プロフィールはブラウザの`localStorage`に保存され、次回起動時も保持されます。会話履歴は保存されません(ページを再読み込みすると新しい会話が始まります)。

## 機能

- プロフィールに基づいたパーソナライズされた英会話練習
- 日本語の下書き→自分の英作文→AIの模範解答、という練習フロー
- プロフィールの編集、会話のリセット

## 必要なもの

- Node.js 18.18 以上
- Anthropic APIキー([console.anthropic.com](https://console.anthropic.com) で発行。利用には別途料金がかかります)

## ローカルで動かす

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` を開いて `ANTHROPIC_API_KEY` に発行したAPIキーを設定してください。

```bash
npm run dev
```

http://localhost:3000 を開いてください。

## Vercelにデプロイ

1. このフォルダをGitHubリポジトリにpushする
2. [Vercel](https://vercel.com/new) でそのリポジトリをImport
3. Environment Variablesに `ANTHROPIC_API_KEY` を追加(Anthropic Consoleで発行したキー)
4. Deployをクリック

APIキーはサーバー側(API Route)でのみ使用され、ブラウザには送られません。
