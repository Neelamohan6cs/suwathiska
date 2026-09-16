import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HiOutlineMapPin, HiOutlinePhone } from "react-icons/hi2";
import { getOrderById, cancelOrder } from "../../api/orderApi";
import { formatCurrency, formatDate, formatDistance, formatDuration } from "../../utils/format";
import { fileUrl } from "../../api/axios";
import PageLoader from "../../components/common/PageLoader";
import OrderStatusTimeline from "../../components/customer/OrderStatusTimeline";
import DeliveryRouteMap from "../../components/common/DeliveryRouteMap";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { useSocket } from "../../context/SocketContext";

export default function OrderDetails() {
  const { orderId } = useParams();
  const toast = useToast();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = () => {
    getOrderById(orderId)
      .then((res) => {
        setOrder(res.data.order);
        setDelivery(res.data.delivery || null);
        if (res.data.delivery?.route) setRoute(res.data.delivery.route);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;
    socket.joinOrderRoom(orderId);

    const handleDriverUpdate = (payload) => {
      if (payload.orderId !== orderId) return;
      setDelivery((prev) => ({ ...(prev || {}), driverLocation: payload.driverLocation }));
    };

    const handleRideStarted = (payload) => {
      if (payload.orderId !== orderId) return;
      setDelivery((prev) => ({ ...(prev || {}), status: "Out for Delivery", driverLocation: payload.driverLocation }));
      if (payload.route) setRoute(payload.route);
    };

    const handleStatusUpdate = (payload) => {
      if (payload.orderId !== orderId) return;
      setOrder((prev) => (prev ? { ...prev, orderStatus: payload.orderStatus } : prev));
      setDelivery((prev) => ({ ...(prev || {}), status: payload.status }));
    };

    socket.on("driverLocationUpdate", handleDriverUpdate);
    socket.on("rideStarted", handleRideStarted);
    socket.on("deliveryStatusUpdate", handleStatusUpdate);

    return () => {
      socket.off("driverLocationUpdate", handleDriverUpdate);
      socket.off("rideStarted", handleRideStarted);
      socket.off("deliveryStatusUpdate", handleStatusUpdate);
      socket.leaveOrderRoom(orderId);
    };
  }, [socket, orderId]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrder(orderId, "Cancelled by customer");
      toast.success("Order cancelled");
      setConfirmOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader label="Loading order" />;
  if (!order) return null;

  const canCancel = ["Pending", "Confirmed"].includes(order.orderStatus);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl">Order #{order.orderId}</h1>
          <p className="mt-1 text-sm text-ink/55">Placed on {formatDate(order.createdAt)}</p>
        </div>
        {canCancel && (
          <button onClick={() => setConfirmOpen(true)} className="btn-danger">
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 font-display text-base text-dairy-900">Order Tracking</h2>
            <OrderStatusTimeline status={order.orderStatus} />
          </div>

          {order.orderStatus === "Out for Delivery" && order.deliveryLocation?.latitude && (
            <div className="card p-5">
              <h2 className="mb-4 font-display text-base text-dairy-900">Live Delivery Tracking</h2>
              <DeliveryRouteMap
                driverLocation={delivery?.driverLocation}
                customerLocation={order.deliveryLocation}
                routeGeometry={route?.geometry}
              />
              <div className="mt-3 flex items-center justify-between text-sm text-ink/60">
                <span>Distance: {formatDistance(route?.distanceMeters)}</span>
                <span>ETA: {formatDuration(route?.durationSeconds)}</span>
              </div>
              {!delivery?.driverLocation && (
                <p className="mt-2 text-xs text-ink/45">Waiting for the driver's live location…</p>
              )}
            </div>
          )}

          <div className="card p-5">
            <h2 className="mb-4 font-display text-base text-dairy-900">Items</h2>
            <div className="divide-y divide-dairy-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-ink/70">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-ink">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 font-display text-base text-dairy-900">Delivery Address</h2>
            <div className="flex items-start gap-2 text-sm text-ink/70">
              <HiOutlineMapPin className="mt-0.5 h-4 w-4 shrink-0 text-dairy-500" />
              <p>
                {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                {order.shippingAddress?.landmark && `, near ${order.shippingAddress.landmark}`}
              </p>
            </div>
            {order.shippingAddress?.phone && (
              <div className="mt-2 flex items-center gap-2 text-sm text-ink/70">
                <HiOutlinePhone className="h-4 w-4 shrink-0 text-dairy-500" />
                {order.shippingAddress.phone}
              </div>
            )}
            {order.deliveryPerson && (
              <p className="mt-3 rounded-lg bg-dairy-50 px-3 py-2 text-xs text-dairy-700">
                Delivery partner: {order.deliveryPerson.name} · {order.deliveryPerson.phone}
              </p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-display text-base text-dairy-900">Payment</h2>
            <div className="space-y-2 text-sm text-ink/70">
              <div className="flex justify-between"><span>Method</span><span className="font-medium text-ink">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span>Status</span><span className="font-medium text-ink">{order.paymentStatus}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery charge</span><span>{order.deliveryCharge === 0 ? "Free" : formatCurrency(order.deliveryCharge)}</span></div>
              <div className="flex justify-between border-t border-dairy-100 pt-2 font-display text-base font-semibold text-dairy-900">
                <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this order?"
        description="This cannot be undone. Any payment made will be refunded."
        confirmLabel="Yes, cancel order"
        tone="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
