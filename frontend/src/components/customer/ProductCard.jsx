import { Link } from "react-router-dom";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { fileUrl } from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import { useLanguage } from "../../context/LanguageContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Rating from "../common/Rating";
import Badge from "../common/Badge";

export default function ProductCard({ product }) {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const toast = useToast();

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const outOfStock = !product.isAvailable || product.stock <= 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    try {
      await addItem(product, product.minOrderQty || 1);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.message || "Could not add to cart");
    }
  };

  return (
    <Link
      to={`/product/details/${product._id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-dairy-50">
        {primaryImage ? (
          <img
            src={fileUrl(primaryImage.url)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-dairy-200">
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
              <path d="M32 14c7 9 12 16.5 12 23.5A12 12 0 1 1 20 37.5C20 30.5 25 23 32 14Z" fill="currentColor" />
            </svg>
          </div>
        )}
        {hasDiscount && (
          <Badge tone="bg-wheat-500 text-white absolute left-3 top-3">
            {Math.round(100 - (product.discountPrice / product.price) * 100)}% off
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <Badge tone="bg-ink text-white">Out of Stock</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-dairy-400">
          {product.categoryLabel}
        </span>
        <h3 className="line-clamp-2 font-display text-base leading-snug text-dairy-900">
          {product.name}
        </h3>
        {product.weight?.value ? (
          <span className="text-xs text-ink/50">
            {product.weight.value} {product.weight.unit}
          </span>
        ) : null}

        <div className="mt-1">
          <Rating value={product.rating?.average} count={product.rating?.totalReviews} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-ink/40 line-through">{formatCurrency(product.price)}</span>
                <span className="font-display text-lg font-semibold text-dairy-700">
                  {formatCurrency(product.discountPrice)}
                </span>
              </>
            ) : (
              <span className="font-display text-lg font-semibold text-dairy-700">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-dairy-600 text-white transition hover:bg-dairy-700 disabled:cursor-not-allowed disabled:bg-dairy-200"
            aria-label="Add to cart"
          >
            <HiOutlineShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
