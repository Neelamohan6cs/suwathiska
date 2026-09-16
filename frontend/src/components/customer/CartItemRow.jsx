import { Link } from "react-router-dom";
import { HiOutlineTrash } from "react-icons/hi2";
import { fileUrl } from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import QuantitySelector from "../common/QuantitySelector";
import { useLanguage } from "../../context/LanguageContext";

export default function CartItemRow({ item, onUpdateQty, onRemove, busy }) {
  const { language } = useLanguage(); // "en" | "ta"
  const product = item.product;
  const image = product?.images?.find((i) => i.isPrimary) || product?.images?.[0];
  const stock = product?.stock ?? 99;
  const productName = product?.name?.[language] || product?.name?.en || "";

  return (
    <div className="flex items-center gap-4 border-b border-dairy-100 py-5 last:border-0">
      <Link to={`/product/details/${item.productId}`} className="shrink-0">
        {image ? (
          <img
            src={fileUrl(image.url)}
            alt={productName}
            className="h-20 w-20 rounded-lg object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg bg-dairy-100" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/product/details/${item.productId}`}
          className="line-clamp-2 font-display text-sm text-dairy-900 hover:text-dairy-600"
        >
          {productName}
        </Link>
        <p className="mt-1 text-sm font-semibold text-dairy-700">{formatCurrency(item.price)}</p>
        {!product?.isAvailable && (
          <p className="mt-1 text-xs font-medium text-clay-500">No longer available</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <QuantitySelector
          value={item.quantity}
          min={1}
          max={stock}
          disabled={busy}
          onChange={(q) => onUpdateQty(item.productId, q)}
        />
        <button
          onClick={() => onRemove(item.productId)}
          disabled={busy}
          className="flex items-center gap-1 text-xs font-medium text-clay-500 hover:text-clay-600"
        >
          <HiOutlineTrash className="h-3.5 w-3.5" /> Remove
        </button>
      </div>

      <div className="hidden w-24 shrink-0 text-right font-display text-sm font-semibold text-ink sm:block">
        {formatCurrency(item.lineTotal)}
      </div>
    </div>
  );
}