import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      items.push(i);
    } else if (items[items.length - 1] !== "...") {
      items.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-6" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-dairy-200 text-dairy-700 disabled:opacity-30"
        aria-label="Previous page"
      >
        <HiChevronLeft className="h-4 w-4" />
      </button>
      {items.map((item, idx) =>
        item === "..." ? (
          <span key={`dots-${idx}`} className="px-1 text-ink/40">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
              item === page
                ? "bg-dairy-600 text-white"
                : "border border-dairy-200 text-dairy-700 hover:bg-dairy-50"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-dairy-200 text-dairy-700 disabled:opacity-30"
        aria-label="Next page"
      >
        <HiChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
