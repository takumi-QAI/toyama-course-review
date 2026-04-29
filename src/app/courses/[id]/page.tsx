"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StarDisplay } from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import AISummaryCard from "@/components/AISummaryCard";
import AdUnit from "@/components/AdUnit";
import Badge, { semesterVariant, courseTypeVariant } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import type { Course, Review } from "@/types";

const COURSE_TYPES = ["必修", "選択必修", "選択"] as const;

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeValue, setContributeValue] = useState("");
  const [contributeSubmitting, setContributeSubmitting] = useState(false);
  const [contributeMsg, setContributeMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [courseRes, reviewsRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/courses/${id}/reviews`),
      ]);
      setCourse(await courseRes.json());
      setReviews(await reviewsRes.json());
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    if (!contributeValue) return;
    setContributeSubmitting(true);
    setContributeMsg(null);
    const res = await fetch(`/api/courses/${id}/contribute`, {
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
    setCourse((prev) =>
      prev ? { ...prev, avgEasyScore: newAvg, _count: { reviews: (prev._count?.reviews ?? 0) + 1 } } : prev
    );
  }

  if (loading) return <PageLoading />;

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState icon="❌" title="授業が見つかりませんでした" />
      </div>
    );
  }

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
          <StarDisplay score={course.avgEasyScore ?? null} count={course._count?.reviews ?? 0} />
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
              href={`/courses/${id}/textbooks`}
              className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              📚 教科書お譲り
            </Link>
          </div>
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
      <AdUnit slot="1234567890" format="horizontal" className="mb-5 min-h-[90px]" />

      {/* AI Summary */}
      <div className="mb-5">
        <AISummaryCard courseId={id} reviewCount={reviews.length} />
      </div>

      {/* Review Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-5">口コミを投稿する</h2>
        <ReviewForm
          courseId={id}
          session={session}
          reviews={reviews}
          onSuccess={handleReviewSuccess}
        />
      </div>

      {/* Reviews List */}
      <div>
        <h2 className="font-bold text-slate-900 mb-4">
          口コミ一覧{" "}
          <span className="text-slate-400 font-normal text-sm">({reviews.length}件)</span>
        </h2>

        {reviews.length === 0 ? (
          <EmptyState
            icon="💬"
            title="まだ口コミがありません"
            description="最初の口コミを投稿しましょう！"
          />
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
