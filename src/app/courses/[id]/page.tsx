"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StarRating, { StarDisplay } from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";
import type { Course, Review } from "@/types";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [easyScore, setEasyScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const [courseRes, reviewsRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/courses/${id}/reviews`),
      ]);
      const courseData = await courseRes.json();
      const reviewsData = await reviewsRes.json();
      setCourse(courseData);
      setReviews(reviewsData);
      setLoading(false);
    }
    load();
  }, [id]);

  async function loadSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    const res = await fetch(`/api/courses/${id}/summary`);
    const data = await res.json();
    if (data.error) {
      setSummaryError(data.error);
    } else {
      setSummary(data.summary);
    }
    setSummaryLoading(false);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !easyScore) {
      setSubmitError("口コミ内容と楽単度を入力してください");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const res = await fetch(`/api/courses/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, easyScore }),
    });
    const data = await res.json();

    if (!res.ok) {
      setSubmitError(data.error);
      setSubmitting(false);
      return;
    }

    setReviews((prev) => [data, ...prev]);
    setContent("");
    setEasyScore(0);
    setSubmitSuccess(true);
    setSummary(null);

    const agg = [...reviews, data].reduce((acc, r) => acc + r.easyScore, 0) / (reviews.length + 1);
    setCourse((prev) => prev ? { ...prev, avgEasyScore: agg, _count: { reviews: (prev._count?.reviews ?? 0) + 1 } } : prev);

    setSubmitting(false);
    setTimeout(() => setSubmitSuccess(false), 3000);
  }

  const alreadyReviewed = session && reviews.some((r) => r.user.id === session.user?.id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        <div className="text-3xl mb-3">⏳</div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">授業が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/courses" className="hover:text-blue-600">授業一覧</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{course.name}</span>
      </nav>

      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {course.faculty.name}
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {course.semester}
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {course.year}年生
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {course.credits}単位
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {course.courseType}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.name}</h1>
        <p className="text-gray-600 mb-4">{course.instructor}</p>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <StarDisplay
            score={course.avgEasyScore ?? null}
            count={course._count?.reviews ?? 0}
          />
          <Link
            href={`/courses/${id}/textbooks`}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            📚 教科書お譲りを見る
          </Link>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <span>🤖</span> AI口コミ要約
          </h2>
          {!summary && !summaryLoading && (
            <button
              onClick={loadSummary}
              disabled={(course._count?.reviews ?? 0) < 3}
              className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              要約を生成
            </button>
          )}
        </div>

        {summaryLoading && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            <span>AIが口コミを分析中...</span>
          </div>
        )}

        {summaryError && (
          <p className="text-sm text-gray-600">{summaryError}</p>
        )}

        {summary && (
          <div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
            <p className="text-xs text-gray-400 mt-2">
              Powered by Groq (Llama 3.3-70B) ・ AIによる自動生成です
            </p>
          </div>
        )}

        {!summary && !summaryLoading && !summaryError && (
          <p className="text-sm text-gray-500">
            {(course._count?.reviews ?? 0) >= 3
              ? "「要約を生成」ボタンを押すとAIが口コミを分析します"
              : `口コミが${3 - (course._count?.reviews ?? 0)}件以上になるとAI要約が利用できます`}
          </p>
        )}
      </div>

      {/* Review Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">口コミを投稿する</h2>

        {!session ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3 text-sm">口コミを投稿するにはログインが必要です</p>
            <Link
              href="/auth/signin"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログインする
            </Link>
          </div>
        ) : alreadyReviewed ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">この授業にはすでに口コミを投稿しています</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                楽単度 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <StarRating value={easyScore} onChange={setEasyScore} size="lg" />
                {easyScore > 0 && (
                  <span className="text-sm text-gray-600">
                    {["", "かなり難しい", "難しい", "普通", "楽", "超楽単"][easyScore]}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                口コミ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="授業の雰囲気、評価方法、受講のポイントなどを書いてください"
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/1000</p>
            </div>

            {submitError && (
              <p className="text-sm text-red-500 mb-3">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-sm text-green-600 mb-3">口コミを投稿しました！</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? "投稿中..." : "投稿する"}
            </button>
          </form>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4">
          口コミ一覧 <span className="text-gray-500 font-normal text-sm">({reviews.length}件)</span>
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">まだ口コミがありません。最初の口コミを投稿しましょう！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
