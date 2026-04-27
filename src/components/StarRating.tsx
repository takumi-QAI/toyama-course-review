"use client";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };

  return (
    <div className="flex gap-0.5" title={`楽単度: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${sizes[size]} transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <span className={star <= value ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ score, count }: { score: number | null; count: number }) {
  if (!score || count === 0) {
    return <span className="text-gray-400 text-sm">口コミなし</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      <StarRating value={Math.round(score)} readonly size="sm" />
      <span className="text-sm font-semibold text-gray-700">{score.toFixed(1)}</span>
      <span className="text-xs text-gray-500">({count}件)</span>
    </div>
  );
}
