"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/courses", label: "授業を探す" },
  { href: "/contact", label: "お問い合わせ" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-slate-900 hover:text-blue-700 transition-colors"
          onClick={() => setOpen(false)}
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">富</span>
          <span>富大口コミ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
            >
              管理
            </Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              <span className="text-sm text-slate-500">{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                新規登録
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="メニュー"
        >
          <div className="w-5 flex flex-col gap-1.5 transition-all">
            <span className={`block h-0.5 bg-slate-700 rounded transition-all origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 bg-slate-700 rounded transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-slate-700 rounded transition-all origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors">
              管理
            </Link>
          )}
          <div className="pt-2 border-t border-slate-100 mt-2">
            {session ? (
              <>
                <p className="px-3 py-1 text-xs text-slate-400">{session.user?.name}</p>
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3">
                <Link href="/auth/signin" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                  ログイン
                </Link>
                <Link href="/auth/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  新規登録
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
