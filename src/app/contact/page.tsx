"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ContactPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("全ての項目を入力してください");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, content }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error);
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">ホーム</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">お問い合わせ</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
      <p className="text-gray-600 text-sm mb-8">
        サイトへのご意見・ご要望・不具合報告などをお送りください。
      </p>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="font-bold text-green-800 mb-2">送信しました</h2>
          <p className="text-green-700 text-sm mb-4">お問い合わせありがとうございます。</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ホームに戻る
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田 太郎"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お問い合わせ内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ご意見・ご要望・不具合報告などをご記入ください"
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/2000</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {submitting ? "送信中..." : "送信する"}
          </button>
        </form>
      )}
    </div>
  );
}
