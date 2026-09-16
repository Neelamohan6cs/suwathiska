export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-dairy-200 bg-dairy-50/40 px-6 py-14 text-center">
      {icon && <div className="text-4xl text-dairy-300">{icon}</div>}
      <h3 className="font-display text-lg text-dairy-900">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
