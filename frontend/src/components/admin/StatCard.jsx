export default function StatCard({ label, value, icon: Icon, tone = "text-dairy-600 bg-dairy-50" }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        {Icon && <Icon className="h-5 w-5" />}
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
        <p className="mt-0.5 font-display text-2xl text-dairy-900">{value}</p>
      </div>
    </div>
  );
}
