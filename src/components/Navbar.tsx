"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight hover:text-blue-200 transition-colors">
          富大口コミ
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/courses" className="text-sm hover:text-blue-200 transition-colors">
            授業一覧
          </Link>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-200">{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="text-sm hover:text-blue-200 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm bg-white text-blue-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                新規登録
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-blue-900 px-4 pb-4 space-y-2">
          <Link href="/courses" className="block py-2 text-sm hover:text-blue-200" onClick={() => setMenuOpen(false)}>
            授業一覧
          </Link>
          {session ? (
            <>
              <p className="text-sm text-blue-300">{session.user?.name}</p>
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                className="block w-full text-left py-2 text-sm hover:text-blue-200"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="block py-2 text-sm hover:text-blue-200" onClick={() => setMenuOpen(false)}>ログイン</Link>
              <Link href="/auth/signup" className="block py-2 text-sm hover:text-blue-200" onClick={() => setMenuOpen(false)}>新規登録</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
