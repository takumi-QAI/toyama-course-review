import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/CourseCard";

async function getTopCourses() {
  const reviews = await prisma.review.groupBy({
    by: ["courseId"],
    _avg: { easyScore: true },
    _count: { easyScore: true },
    having: { easyScore: { _count: { gte: 1 } } },
    orderBy: { _avg: { easyScore: "desc" } },
    take: 6,
  });

  const courses = await Promise.all(
    reviews.map(async (r) => {
      const course = await prisma.course.findUnique({
        where: { id: r.courseId },
        include: { faculty: true, _count: { select: { reviews: true } } },
      });
      return course ? { ...course, avgEasyScore: r._avg.easyScore } : null;
    })
  );

  return courses.filter(Boolean);
}

async function getStats() {
  const [courseCount, reviewCount, userCount] = await Promise.all([
    prisma.course.count(),
    prisma.review.count(),
    prisma.user.count(),
  ]);
  return { courseCount, reviewCount, userCount };
}

export default async function HomePage() {
  const [topCourses, stats] = await Promise.all([getTopCourses(), getStats()]);

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-800/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            富山大学 全 {stats.courseCount.toLocaleString()} 授業掲載中
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight tracking-tight">
            富山大学の授業、
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              リアルな声で選ぼう
            </span>
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            在学生・卒業生による口コミ・楽単情報・教科書お譲り情報を共有するプラットフォーム
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/courses"
              className="bg-white text-slate-900 font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition-colors text-base shadow-lg"
            >
              授業を探す
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600/80 backdrop-blur-sm text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-600 border border-blue-500/50 transition-colors text-base"
            >
              口コミを投稿する
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "登録授業数", value: stats.courseCount, suffix: "件" },
            { label: "口コミ数",   value: stats.reviewCount,  suffix: "件" },
            { label: "登録ユーザー", value: stats.userCount,  suffix: "人" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-blue-700 tabular-nums">
                {s.value.toLocaleString()}
                <span className="text-lg font-semibold">{s.suffix}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {[
            {
              icon: "⭐",
              color: "bg-amber-50 ring-amber-200",
              iconBg: "bg-amber-100",
              title: "楽単度レーティング",
              desc: "★1〜★5 で授業の取りやすさを評価。単位を取りやすい授業が一目でわかります。",
            },
            {
              icon: "🤖",
              color: "bg-purple-50 ring-purple-200",
              iconBg: "bg-purple-100",
              title: "AI 口コミ要約",
              desc: "Groq（Llama 3.3）を使って多数の口コミを自動要約。授業の特徴を素早く把握できます。",
            },
            {
              icon: "📚",
              color: "bg-emerald-50 ring-emerald-200",
              iconBg: "bg-emerald-100",
              title: "教科書お譲り",
              desc: "同じ授業の先輩・同期から教科書を格安で譲ってもらえる。節約になります。",
            },
          ].map((f) => (
            <div key={f.title} className={`bg-white rounded-2xl border ring-1 ${f.color} p-6`}>
              <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center text-2xl mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Top Rated */}
        {topCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">楽単ランキング</h2>
                <p className="text-sm text-slate-500 mt-0.5">口コミ評価の高い授業</p>
              </div>
              <Link href="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                全授業を見る
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCourses.map((course) =>
                course ? <CourseCard key={course.id} course={course as any} /> : null
              )}
            </div>
          </div>
        )}

        {topCourses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-400 mb-3 text-sm">まだ口コミがありません</p>
            <Link href="/courses" className="text-blue-600 hover:underline text-sm font-medium">
              最初の口コミを投稿する →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
