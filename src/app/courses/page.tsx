"use client";

import { useState, useEffect, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import { PageLoading } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import type { Course, Faculty } from "@/types";

const SELECT_CLASS =
  "px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm bg-white text-slate-700";

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

  function handleFacultyChange(val: string) {
    setFacultyId(val);
    setDepartment("");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">授業を探す</h1>
        <p className="text-sm text-slate-500 mt-1">富山大学の全授業から絞り込み・検索できます</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="授業名・担当教員名で検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select value={facultyId} onChange={(e) => handleFacultyChange(e.target.value)} className={SELECT_CLASS}>
              <option value="">全学部</option>
              {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>

            {departments.length > 0 && (
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={SELECT_CLASS}>
                <option value="">全学科</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}

            <select value={semester} onChange={(e) => setSemester(e.target.value)} className={SELECT_CLASS}>
              <option value="">全学期</option>
              {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={year} onChange={(e) => setYear(e.target.value)} className={SELECT_CLASS}>
              <option value="">全学年</option>
              {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>{y}年生</option>)}
            </select>

            {(query || facultyId || department || semester || year) && (
              <button
                onClick={() => { setQuery(""); setFacultyId(""); setDepartment(""); setSemester(""); setYear(""); }}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                リセット
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoading />
      ) : courses.length === 0 ? (
        <EmptyState icon="🔍" title="授業が見つかりませんでした" description="検索条件を変えてお試しください" />
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">
            <span className="font-semibold text-slate-700">{total.toLocaleString()}</span> 件中{" "}
            {(page - 1) * 30 + 1}〜{Math.min(page * 30, total)} 件を表示
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
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← 前へ
              </button>
              <span className="text-sm text-slate-500 px-3">
                {page} / {totalPages} ページ
              </span>
              <button
                onClick={() => fetchCourses(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
