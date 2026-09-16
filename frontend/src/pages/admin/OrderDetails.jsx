import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAdminOrderById, updateOrderStatus, assignDelivery, getDeliveryPersons } from "../../api/adminApi";
import { formatCurrency, formatDate } from "../../utils/format";
import { nextOrderStatus, isOrderFinal } from "../../utils/statusFlow";
import StatusBadge from "../../components/admin/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../context/ToastContext";

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  const load = () => {
    getAdminOrderById(orderId)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [orderId]);

  useEffect(() => {
    if (order?.orderStatus === "Packed") {
      getDeliveryPersons({ status: "approved" }).then((res) => setDeliveryPersons(res.data.deliveryPersons));
    }
  }, [order?.orderStatus]);

  if (loading) return <PageLoader label="Loading order" />;
  if (!order) return null;

  const upcoming = nextOrderStatus(order.orderStatus);
  const canAdvance = upcoming && !["Assigned", "Out for Delivery", "Delivered"].includes(upcoming) && order.orderStatus !== "Packed";
  const canCancel = !isOrderFinal(order.orderStatus);

  const handleAdvance = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order._id, upcoming);
      toast.success(`Order marked as ${upcoming}`);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update order");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await updateOrderStatus(order._id, "Cancelled", "Cancelled by admin");
      toast.success("Order cancelled");
      setCancelOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Could not cancel order");
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDelivery) return;
    setBusy(true);
    try {
      await assignDelivery(order._id, selectedDelivery);
      toast.success("Delivery assigned");
      setAssignOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Could not assign delivery");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl text-dairy-900">Order #{order.orderId}</h2>
          <p className="text-sm text-ink/55">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-4 font-display text-sm text-dairy-900">Items</h3>
            <div className="divide-y divide-dairy-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2.5 text-sm">
                  <span className="text-ink/70">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-ink">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-dairy-100 pt-4 text-sm">
              <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-ink/60"><span>Delivery charge</span><span>{formatCurrency(order.deliveryCharge)}</span></div>
              <div className="flex justify-between font-display text-base font-semibold text-dairy-900"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-display text-sm text-dairy-900">Customer &amp; Delivery Address</h3>
            <p className="text-sm text-ink/70">{order.customer?.name} · {order.customer?.phone}</p>
            <p className="mt-1 text-sm text-ink/70">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            {order.deliveryPerson && (
              <p className="mt-2 rounded-lg bg-dairy-50 px-3 py-2 text-xs text-dairy-700">
                Assigned to {order.deliveryPerson.name} · {order.deliveryPerson.phone}
              </p>
            )}
          </div>
        </div>

        <div className="card h-fit space-y-3 p-5">
          <h3 className="font-display text-sm text-dairy-900">Update Order</h3>

          {order.orderStatus === "Packed" && (
            <button onClick={() => setAssignOpen(true)} className="btn-primary w-full">
              Assign Delivery
            </button>
          )}

          {canAdvance && (
            <button onClick={handleAdvance} disabled={busy} className="btn-primary w-full">
              Mark as {upcoming}
            </button>
          )}

          {["Assigned", "Out for Delivery"].includes(order.orderStatus) && (
            <p className="rounded-lg bg-dairy-50 px-3 py-2 text-xs text-dairy-700">
              Waiting for the delivery partner to update this order.
            </p>
          )}

          {canCancel && (
            <button onClick={() => setCancelOpen(true)} disabled={busy} className="btn-danger w-full">
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {assignOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-card">
            <h3 className="font-display text-lg text-dairy-900">Assign a delivery partner</h3>
            <select
              className="input mt-4"
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
            >
              <option value="">Select delivery person</option>
              {deliveryPersons.map((d) => (
                <option key={d._id} value={d._id}>{d.name} — {d.phone}</option>
              ))}
            </select>
            {deliveryPersons.length === 0 && (
              <p className="mt-2 text-xs text-clay-500">No approved delivery partners available yet.</p>
            )}
            <div className="mt-6 flex justify-end gap-2.5">
              <button className="btn-secondary" onClick={() => setAssignOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAssign} disabled={busy || !selectedDelivery}>
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this order?"
        description="The customer will be notified and any payment will be refunded."
        confirmLabel="Yes, cancel order"
        tone="danger"
        loading={busy}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}
