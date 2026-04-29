import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const facultyId = searchParams.get("facultyId") || "";
  const department = searchParams.get("department") || "";
  const semester = searchParams.get("semester") || "";
  const year = searchParams.get("year") || "";
  const sort = searchParams.get("sort") || "name_asc";
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
      department ? { department: { contains: department, mode: "insensitive" as const } } : {},
      semester
        ? (() => {
            // "第3ターム" → contains "第3" で複合ターム（第3・第4ターム等）もヒット
            const termMatch = semester.match(/^第(\d+)ターム$/);
            return termMatch
              ? { semester: { contains: `第${termMatch[1]}` } }
              : { semester };
          })()
        : {},
      year ? { year: parseInt(year) } : {},
    ],
  };

  const orderBy =
    sort === "easyScore_desc" ? { reviews: { _avg: { easyScore: "desc" as const } } }
    : sort === "reviews_desc" ? { reviews: { _count: "desc" as const } }
    : sort === "createdAt_desc" ? { createdAt: "desc" as const }
    : { name: "asc" as const };

  const [courses, total, faculties, reviewAggregates, semesters] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        faculty: true,
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.course.count({ where }),
    prisma.faculty.findMany({ orderBy: { name: "asc" } }),
    prisma.review.groupBy({
      by: ["courseId"],
      _avg: { easyScore: true },
    }),
    prisma.course.findMany({
      select: { semester: true },
      distinct: ["semester"],
      orderBy: { semester: "asc" },
    }),
  ]);

  const avgMap = Object.fromEntries(
    reviewAggregates.map((r) => [r.courseId, r._avg.easyScore])
  );

  const coursesWithAvg = courses.map((course) => ({
    ...course,
    avgEasyScore: avgMap[course.id] ?? null,
  }));

  // 選択学部の学科一覧
  const departments = facultyId
    ? await prisma.course.findMany({
        where: { facultyId, department: { not: null } },
        select: { department: true },
        distinct: ["department"],
        orderBy: { department: "asc" },
      }).then((rows) => rows.map((r) => r.department).filter(Boolean) as string[])
    : [];

  // 複合ターム（第3・第4ターム, 第1～第3ターム 等）を個別に展開
  const semesterSet = new Set<string>();
  for (const { semester: s } of semesters) {
    if (!s) continue;
    // 全角正規化
    const normalized = s.replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
    // 個別ターム番号を全て抽出（第3・第4ターム → [3,4]、第1～第3ターム → [1,2,3]）
    const termNums = normalized.match(/\d+/g)?.map(Number);
    if (termNums && normalized.includes("ターム")) {
      if (normalized.includes("～")) {
        // 範囲: 第1～第3ターム → 1,2,3
        const [min, max] = [Math.min(...termNums), Math.max(...termNums)];
        for (let i = min; i <= max; i++) semesterSet.add(`第${i}ターム`);
      } else {
        // 列挙: 第3・第4ターム → 3,4
        termNums.forEach((n) => semesterSet.add(`第${n}ターム`));
      }
    } else {
      semesterSet.add(normalized);
    }
  }

  return NextResponse.json({
    courses: coursesWithAvg,
    faculties,
    departments,
    semesters: Array.from(semesterSet).sort(),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
