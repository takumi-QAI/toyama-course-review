import StarRating from "./StarRating";
import type { Review } from "@/types";

const EASY_LABELS = ["", "かなり難しい", "難しい", "普通", "楽", "超楽単"];
const EASY_COLORS = ["", "text-red-500", "text-orange-500", "text-slate-500", "text-blue-500", "text-emerald-600"];

export default function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {review.user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{review.user.name}</p>
            <p className="text-xs text-slate-400">{date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <StarRating value={review.easyScore} readonly size="sm" />
          <span className={`text-xs font-medium ${EASY_COLORS[review.easyScore] ?? "text-slate-500"}`}>
            {EASY_LABELS[review.easyScore]}
          </span>
        </div>
      </div>
      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{review.content}</p>
    </div>
  );
}
