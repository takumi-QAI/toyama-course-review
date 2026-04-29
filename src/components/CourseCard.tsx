import Link from "next/link";
import { StarDisplay } from "./StarRating";
import Badge, { semesterVariant, courseTypeVariant } from "./ui/Badge";
import type { Course } from "@/types";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="h-full bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="blue">{course.faculty.name}</Badge>
          <Badge variant={semesterVariant(course.semester)}>{course.semester}</Badge>
          <Badge variant={courseTypeVariant(course.courseType)}>{course.courseType}</Badge>
        </div>

        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug mb-1 line-clamp-2">
          {course.name}
        </h3>
        <p className="text-sm text-slate-500 mb-4 truncate">{course.instructor}</p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 w-10 shrink-0">楽単</span>
              <StarDisplay score={course.avgEasyScore ?? null} count={course._count?.reviews ?? 0} />
            </div>
          </div>
          {(course.avgInterestScore ?? null) !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 w-10 shrink-0">面白さ</span>
              <StarDisplay score={course.avgInterestScore ?? null} count={0} hideCount />
            </div>
          )}
          <p className="text-xs text-slate-400 text-right">{course.year}年 · {course.credits}単位</p>
        </div>
      </div>
    </Link>
  );
}
