import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const facultyId = searchParams.get("facultyId") || "";
  const semester = searchParams.get("semester") || "";
  const year = searchParams.get("year") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const where = {
    AND: [
      query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { instructor: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {},
      facultyId ? { facultyId } : {},
      semester ? { semester } : {},
      year ? { year: parseInt(year) } : {},
    ],
  };

  const [courses, total, faculties, reviewAggregates] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        faculty: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.course.count({ where }),
    prisma.faculty.findMany({ orderBy: { name: "asc" } }),
    prisma.review.groupBy({
      by: ["courseId"],
      _avg: { easyScore: true },
    }),
  ]);

  const avgMap = Object.fromEntries(
    reviewAggregates.map((r) => [r.courseId, r._avg.easyScore])
  );

  const coursesWithAvg = courses.map((course) => ({
    ...course,
    avgEasyScore: avgMap[course.id] ?? null,
  }));

  return NextResponse.json({
    courses: coursesWithAvg,
    faculties,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
