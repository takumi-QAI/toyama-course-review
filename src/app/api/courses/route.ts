import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const facultyId = searchParams.get("facultyId") || "";
  const semester = searchParams.get("semester") || "";
  const year = searchParams.get("year") || "";

  const courses = await prisma.course.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query } },
                { instructor: { contains: query } },
              ],
            }
          : {},
        facultyId ? { facultyId } : {},
        semester ? { semester } : {},
        year ? { year: parseInt(year) } : {},
      ],
    },
    include: {
      faculty: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const coursesWithAvg = await Promise.all(
    courses.map(async (course) => {
      const agg = await prisma.review.aggregate({
        where: { courseId: course.id },
        _avg: { easyScore: true },
      });
      return { ...course, avgEasyScore: agg._avg.easyScore };
    })
  );

  const faculties = await prisma.faculty.findMany({ orderBy: { name: "asc" } });

  return NextResponse.json({ courses: coursesWithAvg, faculties });
}
