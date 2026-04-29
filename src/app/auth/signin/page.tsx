"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("メールアドレスまたはパスワードが間違っています");
      setLoading(false);
    } else {
      router.push("/courses");
      router.refresh();
    }
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">おかえりなさい</h1>
          <p className="text-slate-500 text-sm">富大口コミにログインしてください</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={INPUT_CLASS}
                placeholder="example@ems.u-toyama.ac.jp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={INPUT_CLASS}
                placeholder="パスワード"
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
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            アカウントをお持ちでない方は{" "}
            <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">新規登録</Link>
          </p>

          <div className="mt-5 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">デモアカウント</p>
            <p className="text-xs text-slate-400">demo@u-toyama.ac.jp / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
