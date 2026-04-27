import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({
    where: { courseId: params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
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
    data: {
      content: content.trim(),
      easyScore: parseInt(String(easyScore)),
      userId: session.user.id,
      courseId: params.id,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  // 口コミが追加されたのでキャッシュされたサマリーをリセット
  await prisma.course.update({
    where: { id: params.id },
    data: { summary: null, summaryAt: null },
  });

  return NextResponse.json(review, { status: 201 });
}
