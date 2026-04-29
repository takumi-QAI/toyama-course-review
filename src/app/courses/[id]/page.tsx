import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CourseDetailClient from "@/components/CourseDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toyama-course-review.vercel.app";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { faculty: true },
  });
  if (!course) return { title: "授業が見つかりません" };

  const title = `${course.name} | 富大口コミ`;
  const description = `${course.faculty.name}・${course.instructor}の授業。楽単度・口コミを確認できます。単位数${course.credits}・${course.semester}開講。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/courses/${params.id}`,
      siteName: "富大口コミ",
      locale: "ja_JP",
      type: "article",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [courseRaw, reviewsRaw, agg] = await Promise.all([
    prisma.course.findUnique({
      where: { id: params.id },
      include: { faculty: true, _count: { select: { reviews: true } } },
    }),
    prisma.review.findMany({
      where: { courseId: params.id },
      include: { user: { select: { id: true, name: true } }, _count: { select: { likes: true } } },
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
    }),
    prisma.review.aggregate({ where: { courseId: params.id }, _avg: { easyScore: true, interestScore: true } }),
  ]);

  if (!courseRaw) notFound();

  let likedSet = new Set<string>();
  if (userId) {
    const likes = await prisma.reviewLike.findMany({
      where: { userId, reviewId: { in: reviewsRaw.map((r) => r.id) } },
      select: { reviewId: true },
    });
    likedSet = new Set(likes.map((l) => l.reviewId));
  }

  const course = { ...courseRaw, avgEasyScore: agg._avg.easyScore, avgInterestScore: agg._avg.interestScore };
  const reviews = reviewsRaw.map((r) => ({
    ...r,
    likeCount: r._count.likes,
    likedByMe: likedSet.has(r.id),
  }));

  return (
    <CourseDetailClient
      course={course as any}
      initialReviews={reviews as any}
      session={session}
    />
  );
}
