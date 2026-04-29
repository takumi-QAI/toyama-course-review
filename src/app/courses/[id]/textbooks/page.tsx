"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TextbookCard from "@/components/TextbookCard";
import AdUnit from "@/components/AdUnit";
import type { Textbook, Course } from "@/types";

const CONDITIONS = ["美品", "良好", "普通", "難あり"] as const;

export default function TextbooksPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [course, setCourse] = useState<Course | null>(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("良好");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    async function load() {
      const [courseRes, textbooksRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/courses/${id}/textbooks`),
      ]);
      setCourse(await courseRes.json());
      setTextbooks(await textbooksRes.json());
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !price || !contact.trim()) {
      setSubmitError("タイトル・価格・連絡先は必須です");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const res = await fetch(`/api/courses/${id}/textbooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, isbn, price: parseInt(price), condition, description, contact }),
    });
    const data = await res.json();

    if (!res.ok) {
      setSubmitError(data.error);
      setSubmitting(false);
      return;
    }

    setTextbooks((prev) => [data, ...prev]);
    setTitle(""); setAuthor(""); setIsbn(""); setPrice("");
    setCondition("良好"); setDescription(""); setContact("");
    setShowForm(false);
    setSubmitting(false);
  }

  function handleStatusChange(tbId: string, newStatus: string) {
    setTextbooks((prev) => prev.map((t) => t.id === tbId ? { ...t, status: newStatus } : t));
  }

  function handleDelete(tbId: string) {
    setTextbooks((prev) => prev.filter((t) => t.id !== tbId));
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        <div className="text-3xl mb-3">⏳</div>読み込み中...
      </div>
    );
  }

  const available = textbooks.filter((t) => t.status === "available");
  const sold = textbooks.filter((t) => t.status === "sold");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/courses" className="hover:text-blue-600">授業一覧</Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${id}`} className="hover:text-blue-600">{course?.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">教科書お譲り</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">教科書お譲りページ</h1>
          {course && (
            <p className="text-gray-600 text-sm">{course.name} ・ {course.instructor}</p>
          )}
        </div>
        {session && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            {showForm ? "キャンセル" : "📚 出品する"}
          </button>
        )}
      </div>

      {/* Listing Form */}
      {showForm && session && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">教科書を出品する</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  書籍タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 電気回路論 第3版"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">著者</label>
                <input
                  value={author} onChange={(e) => setAuthor(e.target.value)}
                  placeholder="例: 山田 太郎"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格（円） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  min="0" max="100000" placeholder="例: 2500"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  状態 <span className="text-red-500">*</span>
                </label>
                <select
                  value={condition} onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
                >
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  value={isbn} onChange={(e) => setIsbn(e.target.value)}
                  placeholder="例: 978-4-..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="書き込みの有無、付録の有無など"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                連絡先（メールアドレス等） <span className="text-red-500">*</span>
              </label>
              <input
                value={contact} onChange={(e) => setContact(e.target.value)}
                placeholder="例: yourname@ems.u-toyama.ac.jp"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">購入希望者からの連絡先として使用されます</p>
            </div>

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            <button
              type="submit" disabled={submitting}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? "出品中..." : "出品する"}
            </button>
          </form>
        </div>
      )}

      {!session && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
          教科書を出品するには{" "}
          <Link href="/auth/signin" className="underline font-medium">ログイン</Link>
          {" "}が必要です
        </div>
      )}

      {/* Ad */}
      <AdUnit slotKey="TEXTBOOKS" format="horizontal" className="mb-6" />

      {/* Available */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-900 mb-3">
          出品中 <span className="text-gray-500 font-normal">({available.length}件)</span>
        </h2>
        {available.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">現在出品されている教科書はありません</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {available.map((tb) => (
              <TextbookCard
                key={tb.id}
                textbook={tb}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sold */}
      {sold.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 mb-3 text-sm">
            譲渡済み <span className="font-normal text-gray-400">({sold.length}件)</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {sold.map((tb) => (
              <TextbookCard
                key={tb.id}
                textbook={tb}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
