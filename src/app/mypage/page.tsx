"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import Badge from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

type MyReview = {
  id: string;
  content: string;
  easyScore: number;
  createdAt: string;
  _count: { likes: number };
  course: { id: string; name: string; faculty: { name: string } };
};

type MyTextbook = {
  id: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  createdAt: string;
  course: { id: string; name: string };
};

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<{ user: any; reviews: MyReview[]; textbooks: MyTextbook[] } | null>(null);
  const [tab, setTab] = useState<"reviews" | "textbooks">("reviews");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return; }
    if (status === "authenticated") {
      fetch("/api/mypage").then(r => r.json()).then(setData);
    }
  }, [status, router]);

  async function markSold(id: string, currentStatus: string) {
    const newStatus = currentStatus === "sold" ? "available" : "sold";
    await fetch(`/api/textbooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setData(prev => prev ? {
      ...prev,
      textbooks: prev.textbooks.map(t => t.id === id ? { ...t, status: newStatus } : t),
    } : prev);
  }

  async function deleteTextbook(id: string) {
    if (!confirm("この出品を削除しますか？")) return;
    await fetch(`/api/textbooks/${id}`, { method: "DELETE" });
    setData(prev => prev ? { ...prev, textbooks: prev.textbooks.filter(t => t.id !== id) } : prev);
  }

  if (status === "loading" || !data) return <PageLoading />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
            {session?.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{session?.user?.name}</p>
            <p className="text-sm text-slate-500">{session?.user?.email}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-700">{data.reviews.length}</p>
            <p className="text-xs text-slate-500">投稿した口コミ</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{data.textbooks.length}</p>
            <p className="text-xs text-slate-500">出品した教科書</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {[
          { id: "reviews" as const, label: `口コミ (${data.reviews.length})` },
          { id: "textbooks" as const, label: `教科書 (${data.textbooks.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Reviews */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {data.reviews.length === 0 ? (
            <EmptyState icon="💬" title="まだ口コミを投稿していません" action={<Link href="/courses" className="text-sm text-blue-600 hover:underline">授業を探す →</Link>} />
          ) : (
            data.reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <Link href={`/courses/${r.course.id}`} className="block mb-2 hover:text-blue-700 transition-colors">
                  <p className="font-semibold text-slate-900">{r.course.name}</p>
                  <p className="text-xs text-slate-400">{r.course.faculty.name}</p>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating value={r.easyScore} readonly size="sm" />
                  {r._count.likes > 0 && (
                    <span className="text-xs text-rose-500">♥ {r._count.likes}人が役に立った</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{r.content}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(r.createdAt).toLocaleDateString("ja-JP")}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Textbooks */}
      {tab === "textbooks" && (
        <div className="space-y-3">
          {data.textbooks.length === 0 ? (
            <EmptyState icon="📚" title="まだ教科書を出品していません" />
          ) : (
            data.textbooks.map((t) => (
              <div key={t.id} className={`bg-white rounded-2xl border border-slate-200 p-5 ${t.status === "sold" ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-semibold text-slate-900">{t.title}</p>
                    <Link href={`/courses/${t.course.id}/textbooks`} className="text-xs text-slate-400 hover:text-blue-600">
                      {t.course.name}
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={t.status === "sold" ? "gray" : "green"}>
                      {t.status === "sold" ? "譲渡済み" : "出品中"}
                    </Badge>
                    <span className="text-sm font-bold text-blue-700">¥{t.price.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">{new Date(t.createdAt).toLocaleDateString("ja-JP")} 出品</p>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => markSold(t.id, t.status)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    {t.status === "sold" ? "出品中に戻す" : "譲渡済みにする"}
                  </button>
                  <button
                    onClick={() => deleteTextbook(t.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
