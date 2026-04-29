import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp();
  const { allowed } = await checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "送信が多すぎます。しばらく待ってから再度お試しください" },
      { status: 429 }
    );
  }

  const { name, email, content } = await req.json();
  if (!name?.trim() || !email?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({
    data: { name: name.trim(), email: email.trim(), content: content.trim() },
  });
  return NextResponse.json(message);
}
