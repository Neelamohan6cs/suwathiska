import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllOrders } from "../../api/adminApi";
import { formatCurrency, formatDate } from "../../utils/format";
import { ORDER_FLOW } from "../../utils/constants";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/common/Pagination";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || 1);

  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllOrders({ status: status || undefined, page, limit: 15 })
      .then((res) => {
        setOrders(res.data.orders);
        setMeta({ total: res.data.total, pages: res.data.pages });
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  const setStatus = (next) => {
    const params = {};
    if (next) params.status = next;
    setSearchParams(params);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">Orders</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatus("")}
            className={`pill ${!status ? "bg-dairy-600 text-white" : "bg-dairy-50 text-dairy-700"}`}
          >
            All
          </button>
          {[...ORDER_FLOW, "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`pill ${status === s ? "bg-dairy-600 text-white" : "bg-dairy-50 text-dairy-700"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading orders" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" description="Try a different status filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-dairy-100 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Delivery</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dairy-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-dairy-50/50">
                  <td className="px-5 py-3.5 font-medium text-ink">{order.orderId}</td>
                  <td className="px-5 py-3.5 text-ink/70">{order.customer?.name}</td>
                  <td className="px-5 py-3.5 text-ink/60">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3.5 font-medium text-ink">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.paymentStatus} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.orderStatus} /></td>
                  <td className="px-5 py-3.5 text-ink/60">{order.deliveryPerson?.name || "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/admin/orders/${order._id}`} className="text-sm font-semibold text-dairy-600 hover:text-dairy-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={meta.pages} onChange={(p) => setSearchParams((prev) => ({ ...Object.fromEntries(prev), page: p }))} />
    </div>
  );
}
