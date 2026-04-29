import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { faculty: true, _count: { select: { reviews: true } } },
  });

  if (!course) {
    return NextResponse.json({ error: "授業が見つかりません" }, { status: 404 });
  }

  const agg = await prisma.review.aggregate({
    where: { courseId: course.id },
    _avg: { easyScore: true, interestScore: true },
  });

  return NextResponse.json({
    ...course,
    avgEasyScore: agg._avg.easyScore,
    avgInterestScore: agg._avg.interestScore,
  });
}
