import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const existing = await prisma.reviewLike.findUnique({
    where: { reviewId_userId: { reviewId: params.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.reviewLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.reviewLike.create({
      data: { reviewId: params.id, userId: session.user.id },
    });
  }

  const count = await prisma.reviewLike.count({ where: { reviewId: params.id } });
  return NextResponse.json({ liked: !existing, count });
}
