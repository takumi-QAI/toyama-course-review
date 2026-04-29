import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const textbooks = await prisma.textbook.findMany({
    where: { courseId: params.id },
    include: { seller: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(textbooks);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { title, author, isbn, price, condition, description, contact, imageUrl } = await req.json();
  if (!title?.trim() || !price || !condition || !contact?.trim()) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }
  if (price < 0 || price > 100000) {
    return NextResponse.json({ error: "価格は0〜100,000円で入力してください" }, { status: 400 });
  }

  const textbook = await prisma.textbook.create({
    data: {
      title: title.trim(),
      author: author?.trim() || null,
      isbn: isbn?.trim() || null,
      price: parseInt(String(price)),
      condition,
      description: description?.trim() || null,
      imageUrl: imageUrl || null,
      contact: contact.trim(),
      sellerId: session.user.id,
      courseId: params.id,
    },
    include: { seller: { select: { id: true, name: true } } },
  });

  return NextResponse.json(textbook, { status: 201 });
}
