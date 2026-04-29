"use client";

import { useEffect } from "react";
import { AD_SLOTS, type AdSlotKey } from "@/config/ads";

type Props = {
  /** 名前付きスロット（推奨）: ads.ts の AD_SLOTS のキー */
  slotKey?: AdSlotKey;
  /** スロット ID を直接指定する場合（後方互換）*/
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
};

export default function AdUnit({ slotKey, slot, format = "auto", className = "" }: Props) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const slotId = slotKey ? AD_SLOTS[slotKey] : (slot ?? "");
  const isReady = !!(publisherId && slotId);

  useEffect(() => {
    if (!isReady) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (_) {}
  }, [isReady]);

  // 未設定のときはプレースホルダーを表示
  if (!isReady) {
    return (
      <div
        className={`bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs min-h-[90px] ${className}`}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-300" />
          広告スペース
          {!publisherId && <span className="text-slate-300">（ADSENSE_ID 未設定）</span>}
          {publisherId && !slotId && <span className="text-slate-300">（スロット ID 未設定）</span>}
        </span>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={publisherId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
