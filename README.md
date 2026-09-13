# シンプルToDo

タスクの「追加・完了チェック・削除」だけに絞った、シンプルでおしゃれなToDo管理アプリです。Next.js（App Router）+ TypeScript + Tailwind CSSで作られています。

## 機能

- タスクの追加
- タスクの完了チェック（オン/オフ切り替え）
- タスクの削除
- 入力内容はブラウザのlocalStorageに保存されるので、再読み込みしても残ります

## ローカルでの動かし方

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開くと確認できます。

## Vercelへのデプロイ方法

1. このプロジェクトをGitHubリポジトリにプッシュします。
2. [vercel.com](https://vercel.com) にGitHubアカウントでログインします。
3. 「Add New...」→「Project」から、このリポジトリを選んでImportします。
4. Next.jsプロジェクトとして自動検出されるので、設定変更は不要です。そのまま「Deploy」を押してください。
5. 数十秒待つと `https://プロジェクト名.vercel.app` のURLでアプリが公開されます。

以降はGitHubにpushするたびに自動で再デプロイされます。
