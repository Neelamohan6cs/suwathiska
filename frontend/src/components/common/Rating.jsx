import { HiStar, HiOutlineStar } from "react-icons/hi2";

export default function Rating({ value = 0, count, size = "text-sm" }) {
  const rounded = Math.round(value);
  return (
    <div className={`flex items-center gap-1 ${size}`}>
      <div className="flex text-wheat-500">
        {Array.from({ length: 5 }).map((_, i) =>
          i < rounded ? <HiStar key={i} /> : <HiOutlineStar key={i} />
        )}
      </div>
      {typeof count === "number" && <span className="text-ink/50">({count})</span>}
    </div>
  );
}
