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
      <div className="bg-gradient-to-br from-blue-800 to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            富山大学の授業、
            <br className="md:hidden" />
            リアルな声で選ぼう
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            在学生・卒業生による口コミ・楽単情報・教科書お譲り情報を共有するプラットフォーム
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/courses"
              className="bg-white text-blue-800 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              授業を探す
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-700 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 border border-blue-500 transition-colors text-lg"
            >
              口コミを投稿する
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "登録授業数", value: stats.courseCount, unit: "件" },
            { label: "口コミ数", value: stats.reviewCount, unit: "件" },
            { label: "登録ユーザー", value: stats.userCount, unit: "人" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-blue-700">
                {s.value.toLocaleString()}
                <span className="text-lg">{s.unit}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {[
            {
              icon: "⭐",
              title: "楽単度レーティング",
              desc: "★1〜★5で授業の取りやすさを評価。単位を取りやすい授業がひとめでわかります。",
            },
            {
              icon: "🤖",
              title: "AI口コミ要約",
              desc: "Groq（Llama 3.3）を使って多数の口コミを自動要約。授業の特徴を素早く把握できます。",
            },
            {
              icon: "📚",
              title: "教科書お譲り",
              desc: "同じ授業の先輩・同期から教科書を格安で譲ってもらえる。節約になります。",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Top rated */}
        {topCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">楽単ランキング</h2>
              <Link href="/courses" className="text-sm text-blue-600 hover:underline">
                全授業を見る →
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
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">まだ口コミがありません</p>
            <Link href="/courses" className="text-blue-600 hover:underline text-sm">
              最初の口コミを投稿する →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
