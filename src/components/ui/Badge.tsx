export type Variant = "blue" | "green" | "orange" | "purple" | "red" | "gray" | "indigo" | "teal" | "rose";

const styles: Record<Variant, string> = {
  blue:   "bg-blue-50   text-blue-700   ring-blue-200",
  green:  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  orange: "bg-orange-50  text-orange-600  ring-orange-200",
  purple: "bg-purple-50  text-purple-700  ring-purple-200",
  red:    "bg-rose-50    text-rose-700    ring-rose-200",
  gray:   "bg-slate-100  text-slate-600   ring-slate-200",
  indigo: "bg-indigo-50  text-indigo-700  ring-indigo-200",
  teal:   "bg-teal-50    text-teal-700    ring-teal-200",
  rose:   "bg-rose-50    text-rose-600    ring-rose-200",
};

export default function Badge({
  children,
  variant = "gray",
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// 学期に対応する色を返す
export function semesterVariant(semester: string): Variant {
  if (semester.includes("前期")) return "green";
  if (semester.includes("後期")) return "orange";
  if (semester.includes("通年")) return "purple";
  if (semester.includes("ターム")) return "indigo";
  return "gray";
}

// 授業区分に対応する色を返す
export function courseTypeVariant(type: string): Variant {
  if (type === "必修") return "red";
  if (type === "選択必修") return "orange";
  return "blue";
}
