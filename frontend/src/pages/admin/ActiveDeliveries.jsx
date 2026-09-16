import { useEffect, useState } from "react";
import { HiOutlineTruck } from "react-icons/hi2";
import { getActiveDeliveries } from "../../api/deliveryApi";
import { formatCurrency } from "../../utils/format";
import StatusBadge from "../../components/admin/StatusBadge";
import DeliveryRouteMap from "../../components/common/DeliveryRouteMap";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";
import { useSocket } from "../../context/SocketContext";

export default function ActiveDeliveries() {
  const socket = useSocket();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const load = () => {
    getActiveDeliveries()
      .then((res) => {
        setDeliveries(res.data.deliveries);
        setSelectedId((prev) => prev || res.data.deliveries[0]?._id || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;
    deliveries.forEach((d) => d.order?._id && socket.joinOrderRoom(d.order._id));

    const handleUpdate = (payload) => {
      setDeliveries((prev) =>
        prev.map((d) => (d.order?._id === payload.orderId ? { ...d, driverLocation: payload.driverLocation } : d))
      );
    };

    socket.on("driverLocationUpdate", handleUpdate);
    return () => socket.off("driverLocationUpdate", handleUpdate);
  }, [socket, deliveries.map((d) => d.order?._id).join(",")]);

  if (loading) return <PageLoader label="Loading active deliveries" />;

  const selected = deliveries.find((d) => d._id === selectedId);

  return (
    <div>
      <h2 className="mb-5 text-xl text-dairy-900">Active Deliveries</h2>

      {deliveries.length === 0 ? (
        <EmptyState icon={<HiOutlineTruck />} title="No active deliveries" description="Assigned deliveries in progress will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-2">
            {deliveries.map((d) => (
              <button
                key={d._id}
                onClick={() => setSelectedId(d._id)}
                className={`card block w-full p-4 text-left transition ${
                  selectedId === d._id ? "ring-2 ring-dairy-500" : "hover:-translate-y-0.5 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-sm text-dairy-900">#{d.order?.orderId}</p>
                  <StatusBadge status={d.status} />
                </div>
                <p className="mt-1 text-xs text-ink/55">{d.order?.customer?.name}</p>
                <p className="mt-1 text-xs text-ink/45">Driver: {d.deliveryPerson?.name}</p>
              </button>
            ))}
          </div>

          <div>
            {selected ? (
              <div className="card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm text-dairy-900">Order #{selected.order?.orderId}</p>
                    <p className="text-xs text-ink/55">
                      {selected.order?.customer?.name} · {formatCurrency(selected.order?.totalAmount)}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                {selected.order?.deliveryLocation?.latitude ? (
                  <DeliveryRouteMap
                    driverLocation={selected.driverLocation}
                    customerLocation={selected.order.deliveryLocation}
                    routeGeometry={selected.route?.geometry}
                    height={420}
                  />
                ) : (
                  <p className="text-sm text-ink/50">No map location saved for this order.</p>
                )}
              </div>
            ) : (
              <EmptyState title="Select a delivery" description="Choose a delivery from the list to see its live map." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
