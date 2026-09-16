import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { getMyOrders } from "../../api/orderApi";
import { formatCurrency, formatDate } from "../../utils/format";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/admin/StatusBadge";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading your orders" />;

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="mb-6 text-2xl sm:text-3xl">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<HiOutlineClipboardDocumentList />}
          title="No orders yet"
          description="Once you place an order, it will show up here."
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-sm text-dairy-900">Order #{order.orderId}</p>
                <p className="mt-1 text-xs text-ink/50">{formatDate(order.createdAt)}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                <span className="font-display text-base font-semibold text-dairy-900">
                  {formatCurrency(order.totalAmount)}
                </span>
                <div className="flex gap-1.5">
                  <StatusBadge status={order.orderStatus} />
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
