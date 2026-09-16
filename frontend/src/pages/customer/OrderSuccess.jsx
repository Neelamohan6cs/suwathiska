import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HiCheckCircle, HiOutlineCreditCard } from "react-icons/hi2";
import { getOrderById } from "../../api/orderApi";
import { verifyOnlinePayment } from "../../api/paymentApi";
import { formatCurrency } from "../../utils/format";
import { useToast } from "../../context/ToastContext";
import PageLoader from "../../components/common/PageLoader";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = () => {
    setLoading(true);
    getOrderById(orderId)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderId]);

  const handleSimulatedPayment = async () => {
    setPaying(true);
    try {
      await verifyOnlinePayment(orderId, `TXN-${Date.now()}`);
      toast.success("Payment received");
      load();
    } catch (err) {
      toast.error(err.message || "Payment could not be verified");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <PageLoader label="Confirming your order" />;
  if (!order) return null;

  const needsOnlinePayment = order.paymentMethod === "Online" && order.paymentStatus === "Pending";

  return (
    <div className="container-page flex justify-center py-14">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-500/10 text-leaf-500">
          <HiCheckCircle className="h-9 w-9" />
        </span>
        <h1 className="mt-5 text-2xl sm:text-3xl">Order Placed Successfully</h1>
        <p className="mt-2 text-sm text-ink/60">Order ID: <span className="font-semibold text-ink">{order.orderId}</span></p>
        <p className="mt-1 text-sm text-ink/60">
          Your order for {formatCurrency(order.totalAmount)} has been received.
        </p>

        {needsOnlinePayment && (
          <div className="card mt-6 space-y-3 p-5 text-left">
            <p className="flex items-center gap-2 font-display text-sm text-dairy-900">
              <HiOutlineCreditCard className="h-4.5 w-4.5" /> Complete your online payment
            </p>
            <p className="text-xs text-ink/55">
              This demo store simulates payment confirmation — no real charge is made.
            </p>
            <button onClick={handleSimulatedPayment} disabled={paying} className="btn-primary w-full">
              {paying ? "Confirming…" : `Pay ${formatCurrency(order.totalAmount)} now`}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link to={`/orders/${order._id}`} className="btn-primary">Track Order</Link>
          <Link to="/my-orders" className="btn-secondary">View My Orders</Link>
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
