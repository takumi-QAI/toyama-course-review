-- ReviewLike テーブル
CREATE TABLE "ReviewLike" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLike_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReviewLike_reviewId_userId_key" UNIQUE ("reviewId", "userId")
);

CREATE INDEX "ReviewLike_reviewId_idx" ON "ReviewLike"("reviewId");

ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_reviewId_fkey"
    FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Textbook に画像URL追加
ALTER TABLE "Textbook" ADD COLUMN "imageUrl" TEXT;

-- RateLimit テーブル
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RateLimit_key_idx" ON "RateLimit"("key");
