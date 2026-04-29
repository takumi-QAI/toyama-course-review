"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";
import { StarDisplay } from "./StarRating";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import AISummaryCard from "./AISummaryCard";
import AdUnit from "./AdUnit";
import ShareButtons from "./ShareButtons";
import Badge, { semesterVariant, courseTypeVariant } from "./ui/Badge";
import EmptyState from "./ui/EmptyState";
import type { Course, Review } from "@/types";

const COURSE_TYPES = ["必修", "選択必修", "選択"] as const;

interface Props {
  course: Course & { avgEasyScore: number | null };
  initialReviews: Review[];
  session: Session | null;
}

export default function CourseDetailClient({ course, initialReviews, session }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeValue, setContributeValue] = useState("");
  const [contributeSubmitting, setContributeSubmitting] = useState(false);
  const [contributeMsg, setContributeMsg] = useState<string | null>(null);

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    if (!contributeValue) return;
    setContributeSubmitting(true);
    setContributeMsg(null);
    const res = await fetch(`/api/courses/${course.id}/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "courseType", value: contributeValue }),
    });
    const data = await res.json();
    setContributeMsg(res.ok ? "提案を送信しました。管理者確認後に反映されます。" : data.error);
    if (res.ok) setContributeOpen(false);
    setContributeSubmitting(false);
  }

  function handleReviewSuccess(review: Review, newAvg: number) {
    setReviews((prev) => [review, ...prev]);
  }

  const avgEasyScore = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.easyScore, 0) / reviews.length
    : course.avgEasyScore;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
        <Link href="/courses" className="hover:text-blue-600 transition-colors">授業一覧</Link>
        <span>/</span>
        <span className="text-slate-700 truncate">{course.name}</span>
      </nav>

      {/* Course Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="blue">{course.faculty.name}</Badge>
          <Badge variant={semesterVariant(course.semester)}>{course.semester}</Badge>
          <Badge variant="gray">{course.year}年生</Badge>
          <Badge variant="gray">{course.credits}単位</Badge>
          <span className="inline-flex items-center gap-1">
            <Badge variant={courseTypeVariant(course.courseType)}>{course.courseType}</Badge>
            {session && (
              <button
                onClick={() => { setContributeOpen(!contributeOpen); setContributeMsg(null); }}
                className="text-slate-400 hover:text-blue-500 transition-colors text-xs"
                title="区分を訂正する"
              >
                ✏️
              </button>
            )}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">{course.name}</h1>
        <p className="text-slate-500 mb-5">{course.instructor}</p>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <StarDisplay score={avgEasyScore ?? null} count={reviews.length} />
          <div className="flex gap-2 flex-wrap">
            {course.syllabusCode && course.syllabusJscd && (
              <a
                href={`https://www.new-syllabus.adm.u-toyama.ac.jp/syllabus/${course.syllabusYear ?? 2026}/${course.syllabusJscd}/${course.syllabusJscd}_${course.syllabusCode}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-slate-700 text-white px-4 py-2 rounded-xl hover:bg-slate-600 transition-colors font-medium"
              >
                📄 シラバスを見る
              </a>
            )}
            <Link
              href={`/courses/${course.id}/textbooks`}
              className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              📚 教科書お譲り
            </Link>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <ShareButtons courseId={course.id} courseName={course.name} />
        </div>
      </div>

      {/* Contribution Form */}
      {contributeOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-blue-800 mb-2">授業区分を訂正する</p>
          <form onSubmit={handleContribute} className="flex items-center gap-2 flex-wrap">
            <select
              value={contributeValue}
              onChange={(e) => setContributeValue(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 text-sm bg-white focus:outline-none focus:border-blue-400"
            >
              <option value="">選択してください</option>
              {COURSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              type="submit"
              disabled={!contributeValue || contributeSubmitting}
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              提案する
            </button>
          </form>
          {contributeMsg && (
            <p className={`text-xs mt-2 ${contributeMsg.includes("送信") ? "text-blue-700" : "text-rose-600"}`}>
              {contributeMsg}
            </p>
          )}
        </div>
      )}

      {/* Ad */}
      <AdUnit slotKey="COURSE_DETAIL_TOP" format="horizontal" className="mb-5" />

      {/* AI Summary */}
      <div className="mb-5">
        <AISummaryCard courseId={course.id} reviewCount={reviews.length} />
      </div>

      {/* Review Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-5">口コミを投稿する</h2>
        <ReviewForm courseId={course.id} session={session} reviews={reviews} onSuccess={handleReviewSuccess} />
      </div>

      {/* Ad */}
      <AdUnit slotKey="COURSE_DETAIL_BOTTOM" format="rectangle" className="mb-5" />

      {/* Reviews List */}
      <div>
        <h2 className="font-bold text-slate-900 mb-4">
          口コミ一覧{" "}
          <span className="text-slate-400 font-normal text-sm">({reviews.length}件)</span>
        </h2>
        {reviews.length === 0 ? (
          <EmptyState icon="💬" title="まだ口コミがありません" description="最初の口コミを投稿しましょう！" />
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} currentUserId={session?.user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
