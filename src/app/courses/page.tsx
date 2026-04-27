"use client";

import { useState, useEffect, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import type { Course, Faculty } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (facultyId) params.set("facultyId", facultyId);
    if (semester) params.set("semester", semester);
    if (year) params.set("year", year);

    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(data.courses);
    setFaculties(data.faculties);
    setLoading(false);
  }, [query, facultyId, semester, year]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">授業一覧</h1>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="授業名・担当教員名で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
            >
              <option value="">全学部</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
            >
              <option value="">全学期</option>
              <option value="前期">前期</option>
              <option value="後期">後期</option>
              <option value="通年">通年</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
            >
              <option value="">全学年</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>{y}年生</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-3xl mb-3">⏳</div>
          <p>読み込み中...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-3xl mb-3">🔍</div>
          <p>授業が見つかりませんでした</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{courses.length}件の授業</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
