"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Badge, { type Variant } from "./ui/Badge";
import type { Textbook } from "@/types";

const CONDITIONS: Record<string, { label: string; variant: Variant }> = {
  美品:   { label: "美品",   variant: "green" },
  良好:   { label: "良好",   variant: "blue" },
  普通:   { label: "普通",   variant: "orange" },
  難あり: { label: "難あり", variant: "red" },
};

export default function TextbookCard({
  textbook,
  onStatusChange,
  onDelete,
}: {
  textbook: Textbook;
  onStatusChange?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const isMine = session?.user?.id === textbook.seller.id;
  const condition = CONDITIONS[textbook.condition] ?? { label: textbook.condition, variant: "gray" as const };
  const isSold = textbook.status === "sold";

  async function handleMarkSold() {
    setLoading(true);
    await fetch(`/api/textbooks/${textbook.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isSold ? "available" : "sold" }),
    });
    onStatusChange?.(textbook.id, isSold ? "available" : "sold");
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("この教科書出品を削除しますか？")) return;
    setLoading(true);
    await fetch(`/api/textbooks/${textbook.id}`, { method: "DELETE" });
    onDelete?.(textbook.id);
    setLoading(false);
  }

  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${isSold ? "opacity-50 border-slate-200" : "border-slate-200 hover:shadow-md"}`}>
      {textbook.imageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden bg-slate-100">
          <img src={textbook.imageUrl} alt={textbook.title} className="w-full max-h-40 object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 leading-snug">{textbook.title}</h4>
          {textbook.author && <p className="text-sm text-slate-500 mt-0.5">{textbook.author}</p>}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isSold && <Badge variant="gray">譲渡済み</Badge>}
          <Badge variant={condition.variant}>{condition.label}</Badge>
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-2xl font-bold text-blue-700">¥{textbook.price.toLocaleString()}</span>
        {textbook.isbn && <span className="text-xs text-slate-400">ISBN: {textbook.isbn}</span>}
      </div>

      {textbook.description && (
        <p className="text-sm text-slate-600 mb-3 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">
          {textbook.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          {textbook.seller.name} · {new Date(textbook.createdAt).toLocaleDateString("ja-JP")}
        </p>
        {!isSold && !isMine && (
          <a
            href={`mailto:${textbook.contact}`}
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            連絡する
          </a>
        )}
      </div>

      {isMine && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={handleMarkSold}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
          >
            {isSold ? "出品中に戻す" : "譲渡済みにする"}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
