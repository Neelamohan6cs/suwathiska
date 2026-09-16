export default function CategoryChip({ label, active, onClick, image }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-dairy-600 bg-dairy-600 text-white shadow-soft"
          : "border-dairy-200 bg-white text-dairy-700 hover:border-dairy-400 hover:bg-dairy-50"
      }`}
    >
      {label}
    </button>
  );
}
