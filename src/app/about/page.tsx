import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて | 富大口コミ",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="text-sm text-slate-400 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">ホーム</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">このサイトについて</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">このサイトについて</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8 text-sm leading-relaxed text-slate-700">

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">サービス概要</h2>
          <p className="mb-3">
            富大口コミは、富山大学の在学生・卒業生が授業に関する情報をリアルな声で共有できる
            非公式プラットフォームです。
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>授業の楽単度・面白さの評価（★1〜★5）</li>
            <li>口コミ・受講のアドバイス投稿</li>
            <li>AI による口コミの自動要約</li>
            <li>教科書のお譲りマーケットプレイス</li>
            <li>富山大学公式シラバスへの直リンク</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">運営者情報</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {[
                { label: "サイト名", value: "富大口コミ" },
                { label: "運営", value: "富山大学学生（個人運営）" },
                { label: "開設", value: "2026年4月" },
                { label: "お問い合わせ", value: "お問い合わせフォームよりご連絡ください" },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="py-2.5 pr-4 text-slate-500 font-medium w-28">{row.label}</td>
                  <td className="py-2.5 text-slate-700">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">免責事項</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>当サイトは富山大学の公式サービスではなく、大学とは一切関係のない個人運営のサービスです。</li>
            <li>掲載されている口コミ・評価はユーザーの主観であり、正確性・完全性を保証するものではありません。</li>
            <li>授業の履修判断は必ず公式シラバス・履修要覧を参照してください。</li>
            <li>当サイトの利用により生じたいかなる損害についても、運営者は責任を負いません。</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">著作権</h2>
          <p>
            当サイト上のコンテンツ（デザイン・コード等）の著作権は運営者に帰属します。
            ユーザーが投稿したコンテンツの著作権は投稿者に帰属しますが、当サイトでの表示・利用を許諾したものとします。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">リンク・引用</h2>
          <p>
            当サイトへのリンクは自由です。
            口コミ等の引用の際は出典として「富大口コミ（toyama-course-review.vercel.app）」を明記してください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">お問い合わせ</h2>
          <p>
            ご意見・ご要望・不適切なコンテンツの報告は
            <Link href="/contact" className="text-blue-600 hover:underline mx-1">お問い合わせフォーム</Link>
            からお願いします。
          </p>
        </section>

      </div>
    </div>
  );
}
