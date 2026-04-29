/**
 * 広告スロット設定
 *
 * Vercel の環境変数で各スロット ID を設定してください。
 * AdSense 管理画面 → 広告ユニット → スロット ID (数字10桁) を確認できます。
 *
 * 設定する環境変数:
 *   NEXT_PUBLIC_ADSENSE_ID     = ca-pub-XXXXXXXXXX  (Publisher ID)
 *   NEXT_PUBLIC_AD_SLOT_1      = XXXXXXXXXX         (授業詳細ページ上部)
 *   NEXT_PUBLIC_AD_SLOT_2      = XXXXXXXXXX         (授業詳細ページ 口コミ下)
 *   NEXT_PUBLIC_AD_SLOT_3      = XXXXXXXXXX         (授業一覧ページ)
 *   NEXT_PUBLIC_AD_SLOT_4      = XXXXXXXXXX         (ホームページ)
 *   NEXT_PUBLIC_AD_SLOT_5      = XXXXXXXXXX         (教科書ページ)
 */

export const AD_SLOTS = {
  /** 授業詳細ページ – ヘッダーと AI 要約の間 */
  COURSE_DETAIL_TOP: process.env.NEXT_PUBLIC_AD_SLOT_1 ?? "",

  /** 授業詳細ページ – 口コミ一覧の下 */
  COURSE_DETAIL_BOTTOM: process.env.NEXT_PUBLIC_AD_SLOT_2 ?? "",

  /** 授業一覧ページ – フィルターと結果の間 */
  COURSE_LIST: process.env.NEXT_PUBLIC_AD_SLOT_3 ?? "",

  /** ホームページ – 機能紹介とランキングの間 */
  HOME: process.env.NEXT_PUBLIC_AD_SLOT_4 ?? "",

  /** 教科書お譲りページ – リストの上 */
  TEXTBOOKS: process.env.NEXT_PUBLIC_AD_SLOT_5 ?? "",
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
