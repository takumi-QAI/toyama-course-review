"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ContactMessage, CourseContribution } from "@/types";

type Stats = {
  userCount: number;
  reviewCount: number;
  courseCount: number;
  todayViews: number;
  unreadMessages: number;
  pendingContributions: number;
  dailyViews: { date: string; count: number }[];
};

const FIELD_LABELS: Record<string, string> = {
  courseType: "授業区分",
  year: "対象学年",
  semester: "学期",
  credits: "単位数",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [contributions, setContributions] = useState<CourseContribution[]>([]);
  const [tab, setTab] = useState<"messages" | "contributions">("messages");
  const [unauthorized, setUnauthorized] = useState(false);

  const loadData = useCallback(async () => {
    const [s, m, c] = await Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/messages").then((r) => r.json()),
      fetch("/api/admin/contributions").then((r) => r.json()),
    ]);
    if (s.error) { setUnauthorized(true); return; }
    setStats(s);
    setMessages(Array.isArray(m) ? m : []);
    setContributions(Array.isArray(c) ? c : []);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return; }
    if (status === "authenticated") loadData();
  }, [status, router, loadData]);

  async function markRead(id: string) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isRead: true } : m));
    setStats((prev) => prev ? { ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) } : prev);
  }

  async function handleContribution(id: string, action: "approve" | "reject") {
    await fetch(`/api/admin/contributions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setContributions((prev) => prev.filter((c) => c.id !== id));
    setStats((prev) => prev ? { ...prev, pendingContributions: Math.max(0, prev.pendingContributions - 1) } : prev);
  }

  if (status === "loading" || (!stats && !unauthorized)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3" />
        <p>読み込み中...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">アクセス権限がありません</p>
      </div>
    );
  }

  const maxViews = Math.max(...(stats?.dailyViews.map((d) => d.count) ?? [1]), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理者ダッシュボード</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "ユーザー数", value: stats!.userCount, icon: "👤" },
          { label: "口コミ数", value: stats!.reviewCount, icon: "💬" },
          { label: "授業数", value: stats!.courseCount, icon: "📖" },
          { label: "今日の訪問", value: stats!.todayViews, icon: "👁" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 7-day chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="text-sm font-bold text-gray-700 mb-4">過去7日間のページビュー</h2>
        <div className="flex items-end gap-2 h-24">
          {stats!.dailyViews.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{d.count}</span>
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${Math.max((d.count / maxViews) * 72, d.count > 0 ? 4 : 2)}px` }}
              />
              <span className="text-xs text-gray-400">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { id: "messages" as const, label: `お問い合わせ`, badge: stats!.unreadMessages },
          { id: "contributions" as const, label: `情報提供`, badge: stats!.pendingContributions },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 transition-colors ${
              tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      {tab === "messages" && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">お問い合わせはありません</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-5 ${msg.isRead ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {!msg.isRead && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">未読</span>
                      )}
                      <span className="font-medium text-gray-900 text-sm">{msg.name}</span>
                      <span className="text-xs text-gray-500">{msg.email}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(msg.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {!msg.isRead && (
                    <button
                      onClick={() => markRead(msg.id)}
                      className="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      既読
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contributions */}
      {tab === "contributions" && (
        <div className="space-y-3">
          {contributions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">保留中の情報提供はありません</p>
          ) : (
            contributions.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm mb-1">{c.course.name}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{FIELD_LABELS[c.field] ?? c.field}</span>
                      {" → "}
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                        {c.value}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {c.user.name}（{c.user.email}）・{new Date(c.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleContribution(c.id, "approve")}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleContribution(c.id, "reject")}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      却下
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
