import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "富大口コミ - 富山大学授業口コミサイト",
  description: "富山大学の授業口コミ・楽単情報・教科書お譲り情報を共有するサイト",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm mt-16">
            <p>© 2024 富大口コミ - 富山大学授業口コミサイト</p>
            <p className="mt-1 text-xs">このサイトは学生による非公式のサービスです</p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
