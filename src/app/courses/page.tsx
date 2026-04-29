"use client";

import { useState, useEffect, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import type { Course, Faculty } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (facultyId) params.set("facultyId", facultyId);
    if (department) params.set("department", department);
    if (semester) params.set("semester", semester);
    if (year) params.set("year", year);
    params.set("page", String(p));

    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(data.courses);
    setFaculties(data.faculties);
    setDepartments(data.departments || []);
    if (data.semesters?.length > 0) setSemesters(data.semesters);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setPage(p);
    setLoading(false);
  }, [query, facultyId, department, semester, year]);

  useEffect(() => {
    const t = setTimeout(() => fetchCourses(1), 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  // 学部変更時に学科リセット
  function handleFacultyChange(val: string) {
    setFacultyId(val);
    setDepartment("");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">授業一覧</h1>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="授業名・担当教員名で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={facultyId}
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
            >
              <option value="">全学部</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            {departments.length > 0 && (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
              >
                <option value="">全学科</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
            >
              <option value="">全学期</option>
              {semesters.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 text-sm bg-white"
            >
              <option value="">全学年</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>{y}年生</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p>読み込み中...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-3xl mb-3">🔍</div>
          <p>授業が見つかりませんでした</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total.toLocaleString()}件中 {(page - 1) * 30 + 1}〜{Math.min(page * 30, total)}件を表示
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => fetchCourses(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← 前へ
              </button>
              <span className="text-sm text-gray-600 px-2">
                {page} / {totalPages}ページ
              </span>
              <button
                onClick={() => fetchCourses(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                次へ →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
