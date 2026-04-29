"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/courses");
    router.refresh();
  }

  const INPUT_CLASS =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm transition-colors";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">富</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">アカウントを作成</h1>
          <p className="text-slate-500 text-sm">富大口コミに参加しましょう</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ニックネーム</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={INPUT_CLASS}
                placeholder="例: 工学部生"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT_CLASS}
                placeholder="example@ems.u-toyama.ac.jp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">パスワード（8文字以上）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={INPUT_CLASS}
                placeholder="8文字以上のパスワード"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading && <Spinner size="sm" className="border-white/30 border-t-white" />}
              {loading ? "登録中..." : "アカウントを作成"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/auth/signin" className="text-blue-600 font-medium hover:underline">ログイン</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
