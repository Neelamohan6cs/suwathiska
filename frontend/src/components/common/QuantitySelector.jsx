import { HiMinus, HiPlus } from "react-icons/hi2";

export default function QuantitySelector({ value, onChange, min = 1, max = 99, disabled }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-dairy-200 bg-white">
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full text-dairy-700 transition hover:bg-dairy-50 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <HiMinus className="h-3.5 w-3.5" />
      </button>
      <span className="w-9 text-center text-sm font-semibold text-ink">{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full text-dairy-700 transition hover:bg-dairy-50 disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <HiPlus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
