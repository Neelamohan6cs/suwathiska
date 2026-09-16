import { Link } from "react-router-dom";

export default function Logo({ to = "/", light = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 shrink-0">
      <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={light ? "#FFFFFF" : "#1D6FA8"} fillOpacity={light ? "0.15" : "1"} />
        <path
          d="M32 14c7 9 12 16.5 12 23.5A12 12 0 1 1 20 37.5C20 30.5 25 23 32 14Z"
          fill={light ? "#FFFFFF" : "#F4F9FD"}
        />
      </svg>
      <span className={`font-display text-lg leading-tight ${light ? "text-white" : "text-dairy-900"}`}>
        Suwasthika Dairy
        <span className="block text-[11px] font-body font-semibold uppercase tracking-wide text-wheat-500">
          Feeds &amp; Nutrition
        </span>
      </span>
    </Link>
  );
}
