import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, content } = await req.json();

  if (!name?.trim() || !email?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({
    data: { name: name.trim(), email: email.trim(), content: content.trim() },
  });

  return NextResponse.json(message);
}
