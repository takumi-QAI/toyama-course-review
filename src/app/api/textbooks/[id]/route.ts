import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const textbook = await prisma.textbook.findUnique({ where: { id: params.id } });
  if (!textbook) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  if (textbook.sellerId !== session.user.id) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { status } = await req.json();
  const updated = await prisma.textbook.update({
    where: { id: params.id },
    data: { status },
    include: { seller: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const textbook = await prisma.textbook.findUnique({ where: { id: params.id } });
  if (!textbook) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  if (textbook.sellerId !== session.user.id) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  await prisma.textbook.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
