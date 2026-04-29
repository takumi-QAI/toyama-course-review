import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import Analytics from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "富大口コミ - 富山大学授業口コミサイト",
  description: "富山大学の授業口コミ・楽単情報・教科書お譲り情報を共有するサイト",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="ja" className={inter.variable}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-2137582232537319" />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <SessionProvider>
          <Analytics />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <VercelAnalytics />
          <footer className="bg-slate-900 text-slate-400 mt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                <p className="font-semibold text-slate-300">富大口コミ</p>
                <nav className="flex flex-wrap justify-center gap-4 text-xs">
                  <a href="/about" className="hover:text-slate-200 transition-colors">このサイトについて</a>
                  <a href="/privacy" className="hover:text-slate-200 transition-colors">プライバシーポリシー</a>
                  <a href="/contact" className="hover:text-slate-200 transition-colors">お問い合わせ</a>
                </nav>
              </div>
              <p className="text-center text-xs text-slate-600 mt-4">© 2026 学生による非公式サービスです。富山大学とは無関係です。</p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
