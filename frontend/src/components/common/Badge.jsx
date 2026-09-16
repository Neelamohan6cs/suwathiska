export default function Badge({ children, tone = "bg-dairy-50 text-dairy-700", className = "" }) {
  return <span className={`pill ${tone} ${className}`}>{children}</span>;
}
