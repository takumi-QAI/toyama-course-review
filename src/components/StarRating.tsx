"use client";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const LABELS = ["", "かなり難しい", "難しい", "普通", "楽", "超楽単"];

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const sizes = { sm: "text-base", md: "text-2xl", lg: "text-3xl" };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          title={readonly ? undefined : LABELS[star]}
          className={`${sizes[size]} leading-none transition-transform ${
            !readonly ? "hover:scale-125 cursor-pointer" : "cursor-default"
          }`}
        >
          <span className={star <= value ? "text-amber-400" : "text-slate-200"}>★</span>
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({
  score,
  count,
  hideCount = false,
}: {
  score: number | null;
  count: number;
  hideCount?: boolean;
}) {
  if (!score || (count === 0 && !hideCount)) {
    return <span className="text-slate-400 text-sm">口コミなし</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      <StarRating value={Math.round(score)} readonly size="sm" />
      <span className="text-sm font-bold text-slate-800">{score.toFixed(1)}</span>
      {!hideCount && <span className="text-xs text-slate-400">({count}件)</span>}
    </div>
  );
}
