import { fileUrl } from "../../api/axios";
import { formatDate } from "../../utils/format";
import Rating from "../common/Rating";

export default function ReviewCard({ review }) {
  const initials = (review.user?.name || "U").slice(0, 1).toUpperCase();

  return (
    <div className="border-b border-dairy-100 py-5 last:border-0">
      <div className="flex items-start gap-3">
        {review.user?.profileImage ? (
          <img
            src={fileUrl(review.user.profileImage)}
            alt={review.user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dairy-100 font-display text-dairy-700">
            {initials}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{review.user?.name || "Customer"}</p>
            <span className="text-xs text-ink/40">{formatDate(review.createdAt)}</span>
          </div>
          <Rating value={review.rating} />
          {review.comment && <p className="mt-2 text-sm text-ink/70">{review.comment}</p>}
        </div>
      </div>
    </div>
  );
}
