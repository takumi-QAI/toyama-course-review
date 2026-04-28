import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import Analytics from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "富大口コミ - 富山大学授業口コミサイト",
  description: "富山大学の授業口コミ・楽単情報・教科書お譲り情報を共有するサイト",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="ja">
      <head>
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
          <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm mt-16">
            <p>© 2026 富大口コミ - 富山大学授業口コミサイト</p>
            <p className="mt-1 text-xs">このサイトは学生による非公式のサービスです</p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
