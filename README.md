# 富大口コミ

富山大学の授業口コミ・楽単情報・教科書お譲りプラットフォーム。

**本番サイト**: https://toyama-course-review.vercel.app/

---

## 機能

- 全授業一覧（学部・学科・学期・学年でフィルター・検索・ソート）
- 楽単度（★1〜★5）付き口コミ投稿・「役に立った」いいね
- Groq (Llama 3.3-70B) による AI 口コミ要約
- 教科書お譲りマーケットプレイス（画像付き出品対応）
- シラバス原本へのリンク・LINE/X シェアボタン
- マイページ（自分の口コミ・出品教科書管理）
- お問い合わせフォーム（レートリミット付き）
- 管理者ダッシュボード（訪問者統計・問い合わせ管理・情報提供承認）
- SEO 対応（サーバーサイドレンダリング・OGP・sitemap.xml）

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| 認証 | NextAuth v4 (JWT + bcrypt) |
| DB | PostgreSQL (Neon) |
| ORM | Prisma |
| AI 要約 | Groq API (Llama 3.3-70B) |
| ホスティング | Vercel |
| アナリティクス | Vercel Analytics + 独自 PageView |

---

## ローカル開発のセットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成:

```env
# Neon の接続文字列（https://console.neon.tech で取得）
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ランダムな文字列（下記コマンドで生成）"

# 管理者メールアドレス（自分のアカウントのメール）
ADMIN_EMAIL="your@email.com"
NEXT_PUBLIC_ADMIN_EMAIL="your@email.com"

# Groq API Key（https://console.groq.com で無料取得）
GROQ_API_KEY="gsk_..."

# Google AdSense（審査通過後に設定）
# NEXT_PUBLIC_ADSENSE_ID="ca-pub-..."
```

NEXTAUTH_SECRET の生成:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Prisma クライアントの生成

```bash
npx prisma generate
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

---

## データベース管理

### DB の中身をブラウザで確認する（Prisma Studio）

```bash
npm run db:studio
```

`http://localhost:5555` が開き、全テーブルの中身を GUI で確認・編集できます。授業・口コミ・ユーザーの確認や削除が手軽にできます。

### Neon コンソールで確認する

https://console.neon.tech にログインしてプロジェクトを選択。
「SQL Editor」タブから直接 SQL を実行できます。

```sql
-- ユーザー数
SELECT COUNT(*) FROM "User";

-- 口コミ数
SELECT COUNT(*) FROM "Review";

-- 本日の訪問者数
SELECT COUNT(*) FROM "PageView"
WHERE "createdAt" >= CURRENT_DATE;

-- 学部ごとの授業数
SELECT f.name, COUNT(c.id) as cnt
FROM "Faculty" f
LEFT JOIN "Course" c ON c."facultyId" = f.id
GROUP BY f.name ORDER BY cnt DESC;

-- 楽単度ランキング（口コミ3件以上の授業）
SELECT c.name, c.instructor, ROUND(AVG(r."easyScore")::numeric, 2) as avg
FROM "Course" c
JOIN "Review" r ON r."courseId" = c.id
GROUP BY c.id, c.name, c.instructor
HAVING COUNT(r.id) >= 3
ORDER BY avg DESC LIMIT 20;
```

### スキーマ変更の手順

1. `prisma/schema.prisma` を編集
2. `prisma/migrations/YYYYMMDDXXXXXX_変更名/migration.sql` を作成（SQL を手書き）
3. Neon に適用:
   ```bash
   npx prisma migrate deploy
   ```
4. Prisma クライアントを再生成:
   ```bash
   npx prisma generate
   ```

---

## シラバスクローリング

### 実行方法

```bash
npm run crawl
```

富山大学のシラバスシステム（CampusSquare）から全授業データを取得して DB に保存します。  
初回で約 **3,085件**、所要時間は約 **15〜20分**。

### 取得できる情報

| フィールド | 内容 |
|-----------|------|
| 授業名 | 日本語名 |
| 担当教員 | 主担当者名 |
| 単位数 | 取得単位数 |
| 対象学年 | 最若学年 |
| 学期 | 前期/後期/第Nターム/通年 etc. |
| 授業区分 | 必修/選択必修/選択 |
| 学科 | 学科情報がある場合 |
| syllabusCode | 時間割コード（URL生成・年次引き継ぎに使用） |

---

## 年次更新の手順（毎年4月）

新年度のシラバスが公開されたら以下を実行します（例: 2027年度への更新）。

### Step 1: 年度を変更

`scripts/crawl-syllabus.ts` の3行目:

```typescript
const YEAR = "2027";  // ← 新年度に変更
```

### Step 2: クローラーを実行

```bash
npm run crawl
```

**口コミ・教科書データは保持されます。**

| 状況 | 動作 |
|------|------|
| 同じ `syllabusCode` の授業 | 授業情報（教員名・単位数等）を上書き更新、口コミはそのまま |
| 新設授業（新しいコード） | 新規追加 |
| 廃止授業（消えたコード） | DB に残る（口コミが消えない） |

### Step 3: 廃止授業の整理（任意）

`syllabusYear` が古い授業を確認して削除:

```bash
npm run db:studio
```
`Course` テーブルで `syllabusYear` でソートして確認。

---

## 管理者ダッシュボード

`/admin` にアクセス（管理者アカウントでログイン時のみ「管理」リンクが表示されます）。

| 機能 | 内容 |
|------|------|
| 統計カード | 総ユーザー数・口コミ数・授業数・今日の訪問者数 |
| ページビューグラフ | 過去7日間の日別訪問数 |
| お問い合わせ受信箱 | ユーザーからの問い合わせ一覧・既読管理 |
| 情報提供の承認 | ユーザーが提案した授業区分の承認/却下 |

### 管理者の設定

Vercel の環境変数に以下を設定:

```
ADMIN_EMAIL=your@email.com
NEXT_PUBLIC_ADMIN_EMAIL=your@email.com
```

---

## Google AdSense の設定

### Step 1: AdSense 申請と Publisher ID 取得

1. https://adsense.google.com でサイト（`toyama-course-review.vercel.app`）を申請
2. 審査通過後、Publisher ID（`ca-pub-XXXXXXXXXX`）を取得
3. Vercel の環境変数に設定:
   ```
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX
   ```

### Step 2: 広告ユニット（スロット）の作成と設定

1. AdSense 管理画面 → **広告** → **広告ユニット** → 「新しい広告ユニットを作成」
2. 用途に合わせて以下の5つを作成し、それぞれの **スロット ID（10桁の数字）** をメモ

| 環境変数 | 配置場所 | 推奨フォーマット |
|---------|---------|----------------|
| `NEXT_PUBLIC_AD_SLOT_1` | 授業詳細ページ – ヘッダー下 | 水平バナー |
| `NEXT_PUBLIC_AD_SLOT_2` | 授業詳細ページ – 口コミ一覧下 | レクタングル |
| `NEXT_PUBLIC_AD_SLOT_3` | 授業一覧ページ – フィルター下 | 水平バナー |
| `NEXT_PUBLIC_AD_SLOT_4` | ホームページ – ランキング上 | 水平バナー |
| `NEXT_PUBLIC_AD_SLOT_5` | 教科書お譲りページ – リスト上 | 水平バナー |

3. Vercel の環境変数に全て設定:
   ```
   NEXT_PUBLIC_AD_SLOT_1=1234567890
   NEXT_PUBLIC_AD_SLOT_2=0987654321
   NEXT_PUBLIC_AD_SLOT_3=1122334455
   NEXT_PUBLIC_AD_SLOT_4=5544332211
   NEXT_PUBLIC_AD_SLOT_5=9988776655
   ```

4. 再デプロイで各スポットに広告が表示されます

> **未設定時の動作**: `NEXT_PUBLIC_ADSENSE_ID` またはスロット ID が未設定のスポットには「広告スペース」プレースホルダーが表示されます。スロットごとに個別に ON/OFF できます。

### スロット設定の場所（コード）

広告の配置場所やフォーマットは `src/config/ads.ts` で一元管理しています。
スロット ID の追加・変更はこのファイルを見れば全て把握できます。

---

## Vercel へのデプロイ

GitHub の `main` ブランチへの push で自動デプロイされます。

### 必要な環境変数

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | Neon の接続文字列 |
| `NEXTAUTH_SECRET` | JWT 署名用の秘密鍵 |
| `NEXTAUTH_URL` | 本番サイトの URL（例: `https://toyama-course-review.vercel.app`） |
| `ADMIN_EMAIL` | 管理者のメールアドレス |
| `NEXT_PUBLIC_ADMIN_EMAIL` | 同上（クライアント側用） |
| `GROQ_API_KEY` | Groq の API キー |
| `NEXT_PUBLIC_SITE_URL` | 本番 URL（sitemap・OGP 用） |
| `NEXT_PUBLIC_ADSENSE_ID` | AdSense Publisher ID |
| `NEXT_PUBLIC_AD_SLOT_1`〜`5` | 各広告スロット ID |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob（教科書画像アップロード） |
| `NEXT_PUBLIC_BLOB_ENABLED` | 画像アップロード ON/OFF（`"true"` で有効） |

### 手動で再デプロイ

Vercel ダッシュボード → Deployments → 最新の行の「...」→ Redeploy

または:

```bash
git commit --allow-empty -m "redeploy" && git push
```

---

## npm スクリプト一覧

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run crawl` | シラバスクローリング |
| `npm run db:seed` | サンプルデータ投入 |
| `npm run db:studio` | Prisma Studio（DB GUI）起動 |
| `npm run db:migrate` | マイグレーション作成（ローカル） |
| `npx prisma migrate deploy` | マイグレーションを Neon に適用 |
| `npx prisma generate` | Prisma クライアント再生成 |
