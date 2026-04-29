import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 富大口コミ",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="text-sm text-slate-400 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">ホーム</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">プライバシーポリシー</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">プライバシーポリシー</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8 text-sm leading-relaxed text-slate-700">

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">1. 基本方針</h2>
          <p>
            富大口コミ（以下「当サイト」）は、ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
            当サイトは、富山大学の学生・卒業生が授業情報を共有するための非公式サービスです。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">2. 収集する情報</h2>
          <p className="mb-2">当サイトでは、以下の情報を収集することがあります。</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>アカウント登録時のメールアドレス・ニックネーム</li>
            <li>投稿した口コミ・教科書出品情報</li>
            <li>ページビュー・アクセスログ（IPアドレスを含む）</li>
            <li>お問い合わせ時に入力された情報</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">3. 利用目的</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>サービスの提供・運営・改善</li>
            <li>不正利用の防止・スパム対策</li>
            <li>お問い合わせへの対応</li>
            <li>サイトの利用状況分析</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">4. 第三者への提供</h2>
          <p>
            当サイトは、法令に基づく場合を除き、収集した個人情報を第三者に提供・開示しません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">5. Google AdSense について</h2>
          <p className="mb-2">
            当サイトでは広告配信サービスとして Google AdSense を使用しています。
            Google AdSense は Cookie を使用してユーザーの興味に応じた広告を表示することがあります。
          </p>
          <p>
            Cookie を無効にする方法や Google AdSense に関する詳細は、
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Google の広告ポリシー
            </a>
            をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">6. Vercel Analytics について</h2>
          <p>
            当サイトでは Vercel Analytics を使用してアクセス解析を行っています。
            収集されるデータはプライバシーに配慮された形式で集計されます。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">7. Cookie の使用</h2>
          <p>
            当サイトでは、ログイン状態の維持のためにセッション Cookie を使用しています。
            ブラウザの設定により Cookie を無効にすることができますが、一部の機能が利用できなくなる場合があります。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">8. 免責事項</h2>
          <p>
            当サイトに掲載されている口コミ・授業情報は、ユーザーが投稿したものであり、
            内容の正確性・完全性を保証するものではありません。
            当サイトの利用により生じたいかなる損害についても、運営者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">9. プライバシーポリシーの変更</h2>
          <p>
            当サイトは、必要に応じて本ポリシーを変更することがあります。
            変更後のポリシーはこのページに掲載します。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-base mb-3">10. お問い合わせ</h2>
          <p>
            プライバシーに関するご質問・ご要望は
            <Link href="/contact" className="text-blue-600 hover:underline mx-1">お問い合わせフォーム</Link>
            からご連絡ください。
          </p>
        </section>

        <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
          制定日：2026年4月30日
        </p>
      </div>
    </div>
  );
}
