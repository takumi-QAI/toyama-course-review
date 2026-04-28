"use client";

import { useEffect } from "react";

type Props = {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
};

export default function AdUnit({ slot, format = "auto", className = "" }: Props) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!publisherId) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (_) {}
  }, [publisherId]);

  if (!publisherId) {
    return (
      <div
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs h-16 ${className}`}
      >
        広告
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={publisherId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
