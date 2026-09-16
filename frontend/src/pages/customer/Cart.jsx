import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import CartItemRow from "../../components/customer/CartItemRow";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency } from "../../utils/format";

export default function Cart() {
  const { items, subtotal, updateItem, removeItem, loading } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);

  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  const handleUpdateQty = async (productId, qty) => {
    setBusyId(productId);
    try {
      await updateItem(productId, qty);
    } catch (err) {
      toast.error(err.message || "Could not update quantity");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      await removeItem(productId);
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error(err.message || "Could not remove item");
    } finally {
      setBusyId(null);
    }
  };

  if (!loading && items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<HiOutlineShoppingBag />}
          title="Your cart is empty"
          description="Browse our range of cattle and calf feed to get started."
          action={
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="mb-6 text-2xl sm:text-3xl">Your Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="card p-5">
          {items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
              busy={busyId === item.productId}
            />
          ))}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 font-display text-lg text-dairy-900">Order Summary</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Delivery charge</span>
              <span>{deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge)}</span>
            </div>
            {subtotal > 0 && subtotal < 500 && (
              <p className="rounded-lg bg-wheat-100 px-3 py-2 text-xs text-wheat-600">
                Add {formatCurrency(500 - subtotal)} more for free delivery
              </p>
            )}
            <div className="flex justify-between border-t border-dairy-100 pt-3 font-display text-base font-semibold text-dairy-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")} className="btn-primary mt-5 w-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
