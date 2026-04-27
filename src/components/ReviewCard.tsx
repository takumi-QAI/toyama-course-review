import StarRating from "./StarRating";
import type { Review } from "@/types";

export default function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {review.user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{review.user.name}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StarRating value={review.easyScore} readonly size="sm" />
          <span className="text-xs text-gray-500 ml-1">楽単度</span>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{review.content}</p>
    </div>
  );
}
