export default function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-8 h-8 border-2" };
  return (
    <div className={`${sizes[size]} border-slate-200 border-t-blue-600 rounded-full animate-spin ${className}`} />
  );
}

export function PageLoading({ label = "読み込み中..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Spinner size="lg" className="mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
