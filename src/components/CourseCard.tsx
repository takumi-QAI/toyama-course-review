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

        <div className="flex items-center justify-between mt-auto">
          <StarDisplay score={course.avgEasyScore ?? null} count={course._count?.reviews ?? 0} />
          <span className="text-xs text-slate-400">
            {course.year}年 · {course.credits}単位
          </span>
        </div>
      </div>
    </Link>
  );
}
