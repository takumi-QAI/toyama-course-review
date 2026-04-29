export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <p className="font-semibold text-slate-700 mb-1">{title}</p>
      {description && <p className="text-sm text-slate-400 mb-4">{description}</p>}
      {action}
    </div>
  );
}
