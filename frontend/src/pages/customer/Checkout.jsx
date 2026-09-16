import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLockClosed, HiOutlineMapPin, HiOutlinePencilSquare } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { createOrder } from "../../api/orderApi";
import { formatCurrency, localize } from "../../utils/format";
import LeafletMapPicker from "../../components/common/LeafletMapPicker";

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState(user?.phone || "");
  const [landmark, setLandmark] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="container-page flex justify-center py-16">
        <div className="card w-full max-w-md p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dairy-50 text-dairy-600">
            <HiOutlineLockClosed className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-xl">Please login or register to continue</h2>
          <p className="mt-2 text-sm text-ink/60">
            An account is required so we can confirm and deliver your order.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link to="/login" state={{ from: location }} className="btn-primary w-full">
              Login
            </Link>
            <Link to="/register" state={{ from: location }} className="btn-secondary w-full">
              Register
            </Link>
            <button
              onClick={() => toast.info("Please sign in to place an order — your cart items are saved.")}
              className="text-sm font-medium text-ink/50 hover:text-ink/70"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmLocation = (loc) => {
    setDeliveryLocation(loc);
    setPickingLocation(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deliveryLocation) {
      toast.error("Please select your delivery location on the map");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const a = deliveryLocation.address;
    const shippingAddress = {
      street: a?.formattedAddress || `${deliveryLocation.latitude}, ${deliveryLocation.longitude}`,
      city: a?.village || a?.city || a?.area || "Not detected",
      state: a?.state || "Not detected",
      pincode: a?.postalCode || "000000",
      landmark,
      phone,
    };

    setPlacing(true);
    try {
      const res = await createOrder({
        shippingAddress,
        paymentMethod,
        deliveryLocation: {
          latitude: deliveryLocation.latitude,
          longitude: deliveryLocation.longitude,
          address: a || undefined,
        },
      });
      await clear().catch(() => {});
      toast.success("Order placed successfully");
      navigate(`/order-success/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="mb-6 text-2xl sm:text-3xl">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 font-display text-base text-dairy-900">Customer Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="input" value={user?.name || ""} disabled />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit phone number"
                />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-display text-base text-dairy-900">Delivery Location</h2>

            {!deliveryLocation && !pickingLocation && (
              <button type="button" onClick={() => setPickingLocation(true)} className="btn-primary w-full">
                <HiOutlineMapPin className="h-4.5 w-4.5" /> Select Delivery Location on Map
              </button>
            )}

            {pickingLocation && (
              <LeafletMapPicker value={deliveryLocation} onConfirm={handleConfirmLocation} />
            )}

            {deliveryLocation && !pickingLocation && (
              <div className="rounded-xl2 border border-dairy-100 bg-dairy-50/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf-600">
                    <HiOutlineMapPin className="h-4 w-4" /> Location Selected
                  </p>
                  <button
                    type="button"
                    onClick={() => setPickingLocation(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-dairy-600 hover:text-dairy-700"
                  >
                    <HiOutlinePencilSquare className="h-3.5 w-3.5" /> Change Location
                  </button>
                </div>
                {deliveryLocation.address ? (
                  <div className="mt-2 space-y-0.5 text-sm text-ink/70">
                    <p>{deliveryLocation.address.formattedAddress}</p>
                    <p className="text-xs text-ink/50">
                      {[
                        deliveryLocation.address.village || deliveryLocation.address.city,
                        deliveryLocation.address.district,
                        deliveryLocation.address.state,
                        deliveryLocation.address.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-wheat-600">
                    Address could not be auto-detected, but your exact map location is saved.
                  </p>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="label">Landmark / Delivery Instructions (optional)</label>
              <input
                className="input"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near temple / blue gate / opposite school…"
              />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-display text-base text-dairy-900">Payment Method</h2>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 rounded-lg border border-dairy-200 px-4 py-3 text-sm">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-dairy-600"
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-dairy-200 px-4 py-3 text-sm">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "Online"}
                  onChange={() => setPaymentMethod("Online")}
                  className="accent-dairy-600"
                />
                Online Payment
              </label>
            </div>
          </div>
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 font-display text-base text-dairy-900">Order Summary</h2>
          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm text-ink/70">
                <span className="line-clamp-1 pr-2">
                  {localize(item.product?.name, "en")} × {item.quantity}
                </span>
                <span className="shrink-0">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-dairy-100 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Delivery charge</span>
              <span>{deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-dairy-100 pt-2 font-display text-base font-semibold text-dairy-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button type="submit" disabled={placing} className="btn-primary mt-5 w-full">
            {placing ? "Placing order…" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
