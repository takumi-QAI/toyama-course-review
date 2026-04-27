# 富大口コミ - 富山大学授業口コミサイト

富山大学の授業口コミ・楽単情報・教科書お譲りを共有するWebアプリです。

## 機能

- 📖 全授業一覧（学部・学年・学期でフィルター・検索）
- ⭐ 楽単度（★1〜★5）付き口コミ投稿
- 🤖 Groq (Llama 3.3) によるAI口コミ要約（無料）
- 📚 教科書お譲りマーケットプレイス
- 🔐 メール・パスワード認証

## セットアップ

### 1. Node.js をインストール

Node.js をまだインストールしていない場合:

```
# 方法1: 公式インストーラー（推奨）
https://nodejs.org/ja/ から LTS版をダウンロード

# 方法2: scoop を使う場合
scoop install nodejs-lts
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. データベースのセットアップ

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. 環境変数の設定

`.env` ファイルを編集してください:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="任意のランダムな文字列"

# Groq APIキー（無料）: https://console.groq.com でサインアップして取得
GROQ_API_KEY="gsk_..."
```

**NEXTAUTH_SECRET の生成方法:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## デモアカウント

- メール: demo@u-toyama.ac.jp
- パスワード: password123

## Groq API（無料LLM）の設定

1. https://console.groq.com にアクセスしてアカウントを作成
2. 「API Keys」から新しいAPIキーを生成
3. `.env` の `GROQ_API_KEY` にセット
4. 口コミが3件以上になると「AI要約を生成」ボタンが利用可能になります

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **データベース**: SQLite + Prisma
- **認証**: NextAuth.js v4
- **スタイリング**: Tailwind CSS
- **LLM**: Groq API (Llama 3.3-70B) - 無料枠あり

## コマンド一覧

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run db:migrate   # DBマイグレーション
npm run db:seed      # シードデータ投入
npm run db:studio    # Prisma Studio（DB GUI）
```
