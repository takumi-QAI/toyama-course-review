import Link from "next/link";
import { StarDisplay } from "./StarRating";
import type { Course } from "@/types";

const semesterColors: Record<string, string> = {
  前期: "bg-green-100 text-green-700",
  後期: "bg-orange-100 text-orange-700",
  通年: "bg-purple-100 text-purple-700",
};

const typeColors: Record<string, string> = {
  必修: "bg-red-100 text-red-700",
  選択: "bg-blue-100 text-blue-700",
  自由: "bg-gray-100 text-gray-700",
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
            {course.name}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${semesterColors[course.semester] ?? "bg-gray-100 text-gray-700"}`}>
              {course.semester}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[course.courseType] ?? "bg-gray-100 text-gray-700"}`}>
              {course.courseType}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-1">
          {course.instructor} ・ {course.faculty.name}
        </p>
        <p className="text-xs text-gray-400 mb-3">
          {course.year}年生 ・ {course.credits}単位
        </p>

        <StarDisplay
          score={course.avgEasyScore ?? null}
          count={course._count?.reviews ?? 0}
        />
      </div>
    </Link>
  );
}
