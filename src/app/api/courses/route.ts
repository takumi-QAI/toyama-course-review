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
            const termMatch = semester.match(/^第(\d+)ターム$/);
            return termMatch
              ? { semester: { contains: `第${termMatch[1]}` } }
              : { semester };
          })()
        : {},
      year ? { year: parseInt(year) } : {},
    ],
  };

  const [faculties, semesters] = await Promise.all([
    prisma.faculty.findMany({ orderBy: { name: "asc" } }),
    prisma.course.findMany({
      select: { semester: true },
      distinct: ["semester"],
      orderBy: { semester: "asc" },
    }),
  ]);

  // easyScore_desc: groupByで平均値を計算してソートし、ページネーション
  if (sort === "easyScore_desc") {
    const [allIds, avgScores] = await Promise.all([
      prisma.course.findMany({ where, select: { id: true } }),
      prisma.review.groupBy({
        by: ["courseId"],
        _avg: { easyScore: true },
        orderBy: { _avg: { easyScore: "desc" } },
      }),
    ]);

    const idSet = new Set(allIds.map((c) => c.id));
    const avgMap = Object.fromEntries(
      avgScores.map((a) => [a.courseId, a._avg.easyScore ?? 0])
    );

    const sortedIds = [
      ...avgScores.map((a) => a.courseId).filter((id) => idSet.has(id)),
      ...allIds.map((c) => c.id).filter((id) => !avgMap[id]),
    ];

    const total = sortedIds.length;
    const paginatedIds = sortedIds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const unsorted = await prisma.course.findMany({
      where: { id: { in: paginatedIds } },
      include: { faculty: true, _count: { select: { reviews: true } } },
    });

    const courseMap = new Map(unsorted.map((c) => [c.id, c]));
    const courses = paginatedIds
      .map((id) => courseMap.get(id))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((c) => ({ ...c, avgEasyScore: avgMap[c.id] ?? null }));

    return NextResponse.json({
      courses,
      faculties,
      departments: await getDepartments(facultyId),
      semesters: buildSemesterList(semesters),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  }

  // 通常ソート
  const orderBy =
    sort === "reviews_desc" ? { reviews: { _count: "desc" as const } }
    : sort === "createdAt_desc" ? { createdAt: "desc" as const }
    : { name: "asc" as const };

  const [courses, total, reviewAggregates] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { faculty: true, _count: { select: { reviews: true } } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.course.count({ where }),
    prisma.review.groupBy({
      by: ["courseId"],
      _avg: { easyScore: true, interestScore: true },
    }),
  ]);

  const avgMap = Object.fromEntries(
    reviewAggregates.map((r) => [r.courseId, r._avg])
  );

  const coursesWithAvg = courses.map((course) => ({
    ...course,
    avgEasyScore: avgMap[course.id]?.easyScore ?? null,
    avgInterestScore: avgMap[course.id]?.interestScore ?? null,
  }));

  return NextResponse.json({
    courses: coursesWithAvg,
    faculties,
    departments: await getDepartments(facultyId),
    semesters: buildSemesterList(semesters),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

async function getDepartments(facultyId: string): Promise<string[]> {
  if (!facultyId) return [];
  const rows = await prisma.course.findMany({
    where: { facultyId, department: { not: null } },
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });
  return rows.map((r) => r.department).filter(Boolean) as string[];
}

function buildSemesterList(semesters: { semester: string | null }[]): string[] {
  const set = new Set<string>();
  for (const { semester: s } of semesters) {
    if (!s) continue;
    const normalized = s.replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
    const termNums = normalized.match(/\d+/g)?.map(Number);
    if (termNums && normalized.includes("ターム")) {
      if (normalized.includes("～")) {
        const [min, max] = [Math.min(...termNums), Math.max(...termNums)];
        for (let i = min; i <= max; i++) set.add(`第${i}ターム`);
      } else {
        termNums.forEach((n) => set.add(`第${n}ターム`));
      }
    } else {
      set.add(normalized);
    }
  }
  return Array.from(set).sort();
}
