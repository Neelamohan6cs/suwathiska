import { HiCheck } from "react-icons/hi2";
import { ORDER_FLOW, ORDER_STATUS_LABELS } from "../../utils/constants";

export default function OrderStatusTimeline({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="rounded-xl2 border border-clay-500/20 bg-clay-500/5 p-4 text-sm font-medium text-clay-600">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <ol className="space-y-0">
      {ORDER_FLOW.map((step, idx) => {
        const done = idx <= currentIndex;
        const isLast = idx === ORDER_FLOW.length - 1;
        return (
          <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[15px] top-8 h-full w-0.5 ${
                  idx < currentIndex ? "bg-dairy-500" : "bg-dairy-100"
                }`}
              />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                done
                  ? "border-dairy-600 bg-dairy-600 text-white"
                  : "border-dairy-200 bg-white text-dairy-300"
              }`}
            >
              {done ? <HiCheck className="h-4 w-4" /> : idx + 1}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-semibold ${done ? "text-dairy-900" : "text-ink/40"}`}>
                {ORDER_STATUS_LABELS[step]}
              </p>
              {idx === currentIndex && (
                <p className="mt-0.5 text-xs text-dairy-500">Current status</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
