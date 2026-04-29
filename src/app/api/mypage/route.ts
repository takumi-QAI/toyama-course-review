import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const [reviews, textbooks] = await Promise.all([
    prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: { id: true, name: true, faculty: { select: { name: true } } },
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.textbook.findMany({
      where: { sellerId: session.user.id },
      include: { course: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    user: { name: session.user.name, email: session.user.email },
    reviews,
    textbooks,
  });
}
