import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineBanknotes,
  HiOutlinePlay,
  HiOutlineArrowPath,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";
import {
  getDeliveryById,
  updateDeliveryStatus,
  startRide,
  updateDriverLocation,
  getDeliveryRoute,
} from "../../api/deliveryApi";
import { formatCurrency, formatDistance, formatDuration } from "../../utils/format";
import { nextDeliveryStatus, isDeliveryFinal } from "../../utils/statusFlow";
import { getCurrentPosition, watchPosition } from "../../utils/geolocation";
import { buildNavigateUrl, buildOsmDirectionsUrl } from "../../utils/navigation";
import StatusBadge from "../../components/admin/StatusBadge";
import DeliveryRouteMap from "../../components/common/DeliveryRouteMap";
import PageLoader from "../../components/common/PageLoader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../context/ToastContext";

export default function DeliveryOrderDetails() {
  const { deliveryId } = useParams();
  const toast = useToast();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [startingRide, setStartingRide] = useState(false);
  const [refreshingRoute, setRefreshingRoute] = useState(false);
  const stopWatchRef = useRef(null);

  const load = () => {
    getDeliveryById(deliveryId)
      .then((res) => setDelivery(res.data.delivery))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [deliveryId]);

  useEffect(() => {
    if (delivery?.status !== "Out for Delivery") return undefined;

    stopWatchRef.current = watchPosition(
      (pos) => {
        updateDriverLocation(deliveryId, pos.latitude, pos.longitude).catch(() => {});
      },
      (err) => toast.error(err.message),
      { minIntervalMs: 12000 }
    );

    return () => {
      stopWatchRef.current?.();
      stopWatchRef.current = null;
    };
  }, [delivery?.status, deliveryId]);

  if (loading) return <PageLoader label="Loading delivery" />;
  if (!delivery) return null;

  const order = delivery.order;
  const upcoming = nextDeliveryStatus(delivery.status);
  const final = isDeliveryFinal(delivery.status);
  const customerLocation = order?.deliveryLocation?.latitude ? order.deliveryLocation : null;

  const handleAdvance = async () => {
    setBusy(true);
    try {
      await updateDeliveryStatus(delivery._id, upcoming);
      toast.success(`Marked as ${upcoming}`);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update status");
    } finally {
      setBusy(false);
    }
  };

  const handleFail = async () => {
    setBusy(true);
    try {
      await updateDeliveryStatus(delivery._id, "Failed Delivery", "Customer unavailable");
      toast.success("Marked as failed delivery");
      setFailOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update status");
    } finally {
      setBusy(false);
    }
  };

  const handleStartRide = async () => {
    if (!customerLocation) {
      toast.error("Customer delivery location is not available for this order");
      return;
    }
    setStartingRide(true);
    try {
      const pos = await getCurrentPosition();
      const res = await startRide(deliveryId, pos.latitude, pos.longitude);
      if (res.data.route) {
        toast.success("Ride started — live tracking is on");
      } else {
        toast.info("Ride started, but the route could not be calculated. You can try Refresh Route shortly.");
      }
      load();
    } catch (err) {
      toast.error(err.message || "Could not start the ride");
    } finally {
      setStartingRide(false);
    }
  };

  const handleRefreshRoute = async () => {
    setRefreshingRoute(true);
    try {
      await getDeliveryRoute(deliveryId);
      toast.success("Route updated");
      load();
    } catch (err) {
      toast.error(err.message || "Unable to calculate route right now. Please try again.");
    } finally {
      setRefreshingRoute(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">Order #{order?.orderId}</h2>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {customerLocation && (
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm text-dairy-900">Delivery Route</h3>
                {delivery.status === "Out for Delivery" && (
                  <button
                    onClick={handleRefreshRoute}
                    disabled={refreshingRoute}
                    className="flex items-center gap-1 text-xs font-semibold text-dairy-600 hover:text-dairy-700"
                  >
                    <HiOutlineArrowPath className="h-3.5 w-3.5" /> Refresh route
                  </button>
                )}
              </div>
              <DeliveryRouteMap
                driverLocation={delivery.driverLocation}
                customerLocation={customerLocation}
                routeGeometry={delivery.route?.geometry}
              />
              {delivery.route && (
                <div className="mt-3 flex items-center justify-between text-sm text-ink/60">
                  <span>Distance: {formatDistance(delivery.route.distanceMeters)}</span>
                  <span>ETA: {formatDuration(delivery.route.durationSeconds)}</span>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <a
                  href={buildNavigateUrl(customerLocation.latitude, customerLocation.longitude)}
                  className="btn-secondary flex-1 text-xs"
                >
                  <HiArrowTopRightOnSquare className="h-3.5 w-3.5" /> Navigate
                </a>
                <a
                  href={buildOsmDirectionsUrl(customerLocation.latitude, customerLocation.longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex-1 text-xs"
                >
                  Open in OSM
                </a>
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="mb-3 font-display text-sm text-dairy-900">Customer</h3>
            <p className="text-sm text-ink/70">{order?.customer?.name}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink/70">
              <HiOutlinePhone className="h-4 w-4 text-dairy-500" /> {order?.customer?.phone}
            </div>
            <div className="mt-2 flex items-start gap-2 text-sm text-ink/70">
              <HiOutlineMapPin className="mt-0.5 h-4 w-4 shrink-0 text-dairy-500" />
              {order?.shippingAddress?.street}, {order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}
              {order?.shippingAddress?.landmark && `, near ${order.shippingAddress.landmark}`}
            </div>
            {!customerLocation && (
              <p className="mt-2 text-xs text-wheat-600">
                No map location was saved for this order — use the typed address above for delivery.
              </p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-display text-sm text-dairy-900">Order Items</h3>
            <div className="divide-y divide-dairy-100">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2.5 text-sm">
                  <span className="text-ink/70">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-ink">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm text-dairy-900">
              <HiOutlineBanknotes className="h-4 w-4" /> Payment
            </h3>
            <p className="text-sm text-ink/70">Method: {order?.paymentMethod}</p>
            <p className="mt-1 text-sm text-ink/70">Status: {order?.paymentStatus}</p>
            <p className="mt-3 font-display text-lg font-semibold text-dairy-900">{formatCurrency(order?.totalAmount)}</p>
          </div>

          <div className="card space-y-3 p-5">
            <h3 className="font-display text-sm text-dairy-900">Update Status</h3>

            {delivery.status === "Assigned" && (
              <button onClick={handleStartRide} disabled={startingRide} className="btn-primary w-full">
                <HiOutlinePlay className="h-4.5 w-4.5" /> {startingRide ? "Starting…" : "Start Ride"}
              </button>
            )}

            {delivery.status === "Out for Delivery" && (
              <p className="rounded-lg bg-leaf-500/10 px-3 py-2 text-xs font-medium text-leaf-600">
                Live tracking is active — your location updates automatically.
              </p>
            )}

            {!final && delivery.status !== "Assigned" && upcoming && (
              <button onClick={handleAdvance} disabled={busy} className="btn-primary w-full">
                Mark as {upcoming}
              </button>
            )}

            {!final && (
              <button onClick={() => setFailOpen(true)} disabled={busy} className="btn-danger w-full">
                Report Failed Delivery
              </button>
            )}

            {final && (
              <p className="rounded-lg bg-dairy-50 px-3 py-2 text-xs text-dairy-700">
                This delivery is complete — no further updates needed.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={failOpen}
        title="Report a failed delivery?"
        description="This will notify the customer and admin team that delivery could not be completed."
        confirmLabel="Yes, report failure"
        tone="danger"
        loading={busy}
        onConfirm={handleFail}
        onCancel={() => setFailOpen(false)}
      />
    </div>
  );
}
