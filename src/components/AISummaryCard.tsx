"use client";

import { useState } from "react";
import Spinner from "./ui/Spinner";

interface AISummaryCardProps {
  courseId: string;
  reviewCount: number;
  initialSummary?: string | null;
}

const MIN_REVIEWS = 3;

export default function AISummaryCard({ courseId, reviewCount, initialSummary }: AISummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canGenerate = reviewCount >= MIN_REVIEWS;

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/courses/${courseId}/summary`);
    const data = await res.json();
    if (data.error) setError(data.error);
    else setSummary(data.summary);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs">AI</span>
          AI 口コミ要約
        </h2>
        {!summary && !loading && canGenerate && (
          <button
            onClick={generate}
            className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            要約を生成
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Spinner size="sm" className="border-purple-200 border-t-purple-500" />
          AIが口コミを分析中...
        </div>
      )}

      {error && <p className="text-sm text-slate-600">{error}</p>}

      {summary && (
        <div>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
            Powered by Groq (Llama 3.3-70B) · AIによる自動生成
          </p>
        </div>
      )}

      {!summary && !loading && !error && (
        <p className="text-sm text-slate-500">
          {canGenerate
            ? "「要約を生成」ボタンを押すと AI が口コミを分析します"
            : `口コミが ${MIN_REVIEWS - reviewCount} 件以上になると AI 要約が使えます`}
        </p>
      )}
    </div>
  );
}
