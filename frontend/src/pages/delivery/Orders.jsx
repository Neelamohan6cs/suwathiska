import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HiOutlineTruck } from "react-icons/hi2";
import { getMyDeliveries } from "../../api/deliveryApi";
import { formatCurrency, formatDate } from "../../utils/format";
import StatusBadge from "../../components/admin/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";
import { DELIVERY_FLOW } from "../../utils/constants";

export default function DeliveryOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyDeliveries({ status: status || undefined })
      .then((res) => setDeliveries(res.data.deliveries))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">My Deliveries</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSearchParams({})} className={`pill ${!status ? "bg-dairy-600 text-white" : "bg-dairy-50 text-dairy-700"}`}>All</button>
          {[...DELIVERY_FLOW, "Failed Delivery"].map((s) => (
            <button key={s} onClick={() => setSearchParams({ status: s })} className={`pill ${status === s ? "bg-dairy-600 text-white" : "bg-dairy-50 text-dairy-700"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading deliveries" />
      ) : deliveries.length === 0 ? (
        <EmptyState icon={<HiOutlineTruck />} title="No assigned deliveries" description="New deliveries assigned to you will show up here." />
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <Link
              key={d._id}
              to={`/delivery/orders/${d._id}`}
              className="card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-sm text-dairy-900">Order #{d.order?.orderId}</p>
                <p className="mt-1 text-xs text-ink/50">{d.order?.customer?.name} · {d.order?.customer?.phone}</p>
                <p className="mt-1 text-xs text-ink/40">{formatDate(d.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                <span className="font-display text-base font-semibold text-dairy-900">{formatCurrency(d.order?.totalAmount)}</span>
                <StatusBadge status={d.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
