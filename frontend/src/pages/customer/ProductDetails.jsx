import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { HiOutlineShoppingCart, HiCheckCircle, HiOutlineFilm } from "react-icons/hi2";
import { getProductById, getProductReviews, addProductReview } from "../../api/productApi";
import { getMyOrders } from "../../api/orderApi";
import { fileUrl } from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Rating from "../../components/common/Rating";
import Badge from "../../components/common/Badge";
import QuantitySelector from "../../components/common/QuantitySelector";
import ReviewCard from "../../components/customer/ReviewCard";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";

const TABS = ["Description", "Benefits", "Feeding Guide", "Ingredients"];

export default function ProductDetails() {
  const { productId } = useParams();
  const { lang } = useLanguage();
  const { isAuthenticated, role, user } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(TABS[0]);
  const [reviews, setReviews] = useState([]);
  const [reviewableOrder, setReviewableOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProductById(productId, { lang })
      .then((res) => {
        if (!active) return;
        setProduct(res.data.product);
        setQty(res.data.product.minOrderQty || 1);
        setActiveImage(0);
      })
      .catch(() => active && setProduct(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId, lang]);

  useEffect(() => {
    let active = true;
    getProductReviews(productId).then((res) => {
      if (active) setReviews(res.data.reviews);
    });
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!isAuthenticated || role !== "customer") {
      setReviewableOrder(null);
      return;
    }
    let active = true;
    getMyOrders().then((res) => {
      if (!active) return;
      const eligible = res.data.orders.find(
        (o) => o.orderStatus === "Delivered" && o.items.some((i) => i.product === productId)
      );
      setReviewableOrder(eligible || null);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated, role, productId, reviews]);

  if (loading) return <PageLoader label="Loading product" />;

  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Product not found" description="This product may have been removed." />
      </div>
    );
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const outOfStock = !product.isAvailable || product.stock <= 0;
  const images = product.images?.length ? product.images : [];

  const handleAddToCart = async () => {
    try {
      await addItem(product, qty);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.message || "Could not add to cart");
    }
  };

  const handleBuyNow = async () => {
    try {
      await addItem(product, qty);
      navigate("/checkout");
    } catch (err) {
      toast.error(err.message || "Could not add to cart");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewableOrder) return;
    setSubmittingReview(true);
    try {
      await addProductReview(productId, {
        orderId: reviewableOrder._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success("Thanks for your review");
      const res = await getProductReviews(productId);
      setReviews(res.data.reviews);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const alreadyReviewed =
    reviewableOrder &&
    reviews.some((r) => r.user?._id === user?._id && r.order === reviewableOrder._id);

  return (
    <div className="container-page py-8 sm:py-10">
      <nav className="mb-6 text-xs text-ink/50">
        <Link to="/products" className="hover:text-dairy-600">Products</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="card flex aspect-square items-center justify-center overflow-hidden bg-dairy-50">
            {images.length > 0 ? (
              <img
                src={fileUrl(images[activeImage]?.url)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-dairy-200">
                <svg width="96" height="96" viewBox="0 0 64 64" fill="none">
                  <path d="M32 14c7 9 12 16.5 12 23.5A12 12 0 1 1 20 37.5C20 30.5 25 23 32 14Z" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === idx ? "border-dairy-600" : "border-transparent"
                  }`}
                >
                  <img src={fileUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {product.videos?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-dairy-900">
                <HiOutlineFilm className="h-4 w-4" /> Product videos
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {product.videos.map((v, idx) => (
                  <video key={idx} src={fileUrl(v.videoUrl)} controls className="w-full rounded-lg bg-black" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-dairy-400">
            {product.categoryLabel}
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl">{product.name}</h1>
          {product.shortDescription && (
            <p className="mt-2 text-sm text-ink/60">{product.shortDescription}</p>
          )}

          <div className="mt-4">
            <Rating value={product.rating?.average} count={product.rating?.totalReviews} size="text-base" />
          </div>

          <div className="mt-5 flex items-end gap-3">
            {hasDiscount ? (
              <>
                <span className="font-display text-3xl font-semibold text-dairy-700">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="pb-1 text-base text-ink/40 line-through">
                  {formatCurrency(product.price)}
                </span>
                <Badge tone="bg-wheat-500 text-white">
                  {Math.round(100 - (product.discountPrice / product.price) * 100)}% off
                </Badge>
              </>
            ) : (
              <span className="font-display text-3xl font-semibold text-dairy-700">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            {product.weight?.value ? (
              <Badge tone="bg-dairy-50 text-dairy-700">
                {product.weight.value} {product.weight.unit} pack
              </Badge>
            ) : null}
            {outOfStock ? (
              <Badge tone="bg-clay-500/10 text-clay-600">Out of stock</Badge>
            ) : (
              <Badge tone="bg-leaf-500/10 text-leaf-600">
                <HiCheckCircle className="mr-1 h-3.5 w-3.5" /> In stock ({product.stock} left)
              </Badge>
            )}
            {product.suitableFor?.length > 0 && (
              <span className="text-ink/50">Suitable for: {product.suitableFor.join(", ")}</span>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <QuantitySelector
              value={qty}
              min={product.minOrderQty || 1}
              max={product.stock}
              disabled={outOfStock}
              onChange={setQty}
            />
            <button onClick={handleAddToCart} disabled={outOfStock} className="btn-secondary flex-1 sm:flex-none">
              <HiOutlineShoppingCart className="h-4.5 w-4.5" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={outOfStock} className="btn-primary flex-1 sm:flex-none">
              Buy Now
            </button>
          </div>

          <div className="mt-9 border-t border-dairy-100 pt-6">
            <div className="flex gap-5 overflow-x-auto no-scrollbar border-b border-dairy-100">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition ${
                    tab === t ? "border-dairy-600 text-dairy-700" : "border-transparent text-ink/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-5 text-sm leading-relaxed text-ink/70">
              {tab === "Description" && <p>{product.description || "No description provided yet."}</p>}
              {tab === "Benefits" &&
                (product.benefits?.length ? (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {product.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No benefits listed.</p>
                ))}
              {tab === "Feeding Guide" && <p>{product.feedingGuide || "Feeding guide coming soon."}</p>}
              {tab === "Ingredients" &&
                (product.ingredients?.length ? (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {product.ingredients.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No ingredient list provided.</p>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-4 text-xl">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-ink/50">No reviews yet. Be the first to review this product.</p>
          ) : (
            <div className="card p-5">
              {reviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))}
            </div>
          )}
        </div>

        <div>
          {reviewableOrder && !alreadyReviewed && (
            <form onSubmit={submitReview} className="card space-y-4 p-5">
              <h3 className="font-display text-base text-dairy-900">Rate this product</h3>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                    className={`h-9 w-9 rounded-full text-sm font-semibold ${
                      reviewForm.rating >= n ? "bg-wheat-500 text-white" : "bg-dairy-50 text-ink/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Write your review"
                rows={3}
                className="input"
              />
              <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                {submittingReview ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          )}
          {isAuthenticated && role === "customer" && !reviewableOrder && (
            <p className="text-xs text-ink/45">
              You can review this product after it has been delivered to you.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
