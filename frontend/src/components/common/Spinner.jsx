export default function Spinner({ size = "h-5 w-5", className = "" }) {
  return (
    <span
      className={`inline-block ${size} animate-spin rounded-full border-2 border-dairy-200 border-t-dairy-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
