"use client";

import { useState } from "react";
import Link from "next/link";
import StarRating from "./StarRating";
import Spinner from "./ui/Spinner";
import type { Session } from "next-auth";
import type { Review } from "@/types";

const EASY_LABELS     = ["", "かなり難しい", "難しい", "普通", "楽", "超楽単"];
const INTEREST_LABELS = ["", "つまらない", "あまり面白くない", "普通", "面白い", "とても面白い"];

interface ReviewFormProps {
  courseId: string;
  session: Session | null;
  reviews: Review[];
  onSuccess: (review: Review, newAvg: number) => void;
}

export default function ReviewForm({ courseId, session, reviews, onSuccess }: ReviewFormProps) {
  const [content, setContent] = useState("");
  const [easyScore, setEasyScore] = useState(0);
  const [interestScore, setInterestScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const alreadyReviewed = session && reviews.some((r) => r.user.id === session.user?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !easyScore || !interestScore) {
      setError("楽単度・面白さ・口コミ内容を全て入力してください");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/courses/${courseId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, easyScore, interestScore }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setSubmitting(false);
      return;
    }

    const newAvg =
      [...reviews, data].reduce((acc, r) => acc + r.easyScore, 0) / (reviews.length + 1);
    onSuccess(data, newAvg);
    setContent("");
    setEasyScore(0);
    setInterestScore(0);
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (!session) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
        <p className="text-slate-600 mb-3 text-sm">口コミを投稿するにはログインが必要です</p>
        <Link href="/auth/signin" className="inline-block text-sm bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
          ログインする
        </Link>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center">
        <p className="text-emerald-700 text-sm font-medium">✓ この授業には口コミ済みです</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 楽単度 */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          楽単度 <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating value={easyScore} onChange={setEasyScore} size="lg" />
          {easyScore > 0 && (
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
              {EASY_LABELS[easyScore]}
            </span>
          )}
        </div>
      </div>

      {/* 授業の面白さ */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          授業の面白さ <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating value={interestScore} onChange={setInterestScore} size="lg" />
          {interestScore > 0 && (
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
              {INTEREST_LABELS[interestScore]}
            </span>
          )}
        </div>
      </div>

      {/* 口コミ内容 */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          口コミ内容 <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="授業の雰囲気、評価方法、受講のポイントなどを書いてください"
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm resize-none bg-slate-50 focus:bg-white transition-colors"
        />
        <p className="text-xs text-slate-400 mt-1 text-right">{content.length}/1000</p>
      </div>

      {error && (
        <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">✓ 口コミを投稿しました！</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-semibold"
      >
        {submitting && <Spinner size="sm" className="border-white/30 border-t-white" />}
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
