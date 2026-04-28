import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_CONTRIBUTIONS: Record<string, string[]> = {
  courseType: ["必修", "選択必修", "選択"],
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { field, value } = await req.json();

  if (!VALID_CONTRIBUTIONS[field]?.includes(value)) {
    return NextResponse.json({ error: "無効な値です" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) return NextResponse.json({ error: "授業が見つかりません" }, { status: 404 });

  const existing = await prisma.courseContribution.findFirst({
    where: { courseId: params.id, userId: session.user.id, field, approved: false },
  });
  if (existing) {
    return NextResponse.json({ error: "すでに提案済みです" }, { status: 409 });
  }

  const contribution = await prisma.courseContribution.create({
    data: { courseId: params.id, userId: session.user.id, field, value },
  });

  return NextResponse.json(contribution);
}
