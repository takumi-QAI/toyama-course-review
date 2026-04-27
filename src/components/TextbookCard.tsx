"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Textbook } from "@/types";

const conditionLabels: Record<string, { label: string; color: string }> = {
  美品: { label: "美品", color: "bg-green-100 text-green-700" },
  良好: { label: "良好", color: "bg-blue-100 text-blue-700" },
  普通: { label: "普通", color: "bg-yellow-100 text-yellow-700" },
  "難あり": { label: "難あり", color: "bg-red-100 text-red-700" },
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
  const condition = conditionLabels[textbook.condition] ?? { label: textbook.condition, color: "bg-gray-100 text-gray-700" };
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
    <div className={`bg-white rounded-xl border p-5 ${isSold ? "opacity-60 border-gray-200" : "border-gray-200 hover:shadow-sm"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{textbook.title}</h4>
          {textbook.author && <p className="text-sm text-gray-500">{textbook.author}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {isSold && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">譲渡済み</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${condition.color}`}>
            {condition.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl font-bold text-blue-700">¥{textbook.price.toLocaleString()}</span>
        {textbook.isbn && <span className="text-xs text-gray-400">ISBN: {textbook.isbn}</span>}
      </div>

      {textbook.description && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{textbook.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          出品: {textbook.seller.name} ・{" "}
          {new Date(textbook.createdAt).toLocaleDateString("ja-JP")}
        </div>
        {!isSold && !isMine && (
          <a
            href={`mailto:${textbook.contact}`}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            連絡する
          </a>
        )}
      </div>

      {isMine && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleMarkSold}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {isSold ? "出品中に戻す" : "譲渡済みにする"}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
