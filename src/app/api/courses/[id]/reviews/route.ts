import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const reviews = await prisma.review.findMany({
    where: { courseId: params.id },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { likes: true } },
    },
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
  });

  let likedSet = new Set<string>();
  if (userId) {
    const liked = await prisma.reviewLike.findMany({
      where: { userId, reviewId: { in: reviews.map((r) => r.id) } },
      select: { reviewId: true },
    });
    likedSet = new Set(liked.map((l) => l.reviewId));
  }

  return NextResponse.json(
    reviews.map((r) => ({ ...r, likeCount: r._count.likes, likedByMe: likedSet.has(r.id) }))
  );
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { content, easyScore } = await req.json();
  if (!content?.trim() || !easyScore) {
    return NextResponse.json({ error: "口コミ内容と楽単度を入力してください" }, { status: 400 });
  }
  if (easyScore < 1 || easyScore > 5) {
    return NextResponse.json({ error: "楽単度は1〜5で入力してください" }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({
    where: { courseId: params.id, userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "この授業にはすでに口コミを投稿しています" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { content: content.trim(), easyScore: parseInt(String(easyScore)), userId: session.user.id, courseId: params.id },
    include: { user: { select: { id: true, name: true } }, _count: { select: { likes: true } } },
  });

  await prisma.course.update({ where: { id: params.id }, data: { summary: null, summaryAt: null } });

  return NextResponse.json({ ...review, likeCount: 0, likedByMe: false }, { status: 201 });
}
