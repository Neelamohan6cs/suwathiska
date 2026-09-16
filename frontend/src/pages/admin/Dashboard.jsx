import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import { getAdminDashboard } from "../../api/adminApi";
import { formatCurrency } from "../../utils/format";
import StatCard from "../../components/admin/StatCard";
import PageLoader from "../../components/common/PageLoader";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAdminDashboard().then((res) => setData(res.data));
  }, []);

  if (!data) return <PageLoader label="Loading dashboard" />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl text-dairy-900">Overview</h2>
          <p className="text-sm text-ink/55">A snapshot of your store right now</p>
        </div>
        {data.lowStockProducts > 0 && (
          <Link
            to="/admin/inventory"
            className="flex items-center gap-1.5 rounded-full bg-wheat-100 px-4 py-2 text-xs font-semibold text-wheat-600"
          >
            <HiOutlineExclamationTriangle className="h-4 w-4" />
            {data.lowStockProducts} product{data.lowStockProducts > 1 ? "s" : ""} low on stock
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Customers" value={data.customers} icon={HiOutlineUsers} />
        <StatCard label="Total Products" value={data.products} icon={HiOutlineCube} />
        <StatCard label="Total Orders" value={data.orders} icon={HiOutlineClipboardDocumentList} />
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={HiOutlineBanknotes} tone="text-leaf-600 bg-leaf-500/10" />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={HiOutlineClock} tone="text-wheat-600 bg-wheat-100" />
        <StatCard label="Processing Orders" value={data.processingOrders} icon={HiOutlineArrowPath} />
        <StatCard label="Delivered Orders" value={data.deliveredOrders} icon={HiOutlineCheckCircle} tone="text-leaf-600 bg-leaf-500/10" />
        <StatCard label="Cancelled Orders" value={data.cancelledOrders} icon={HiOutlineXCircle} tone="text-clay-600 bg-clay-500/10" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/orders" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-display text-sm text-dairy-900">Manage Orders</p>
          <p className="mt-1 text-xs text-ink/55">Confirm, process and assign delivery</p>
        </Link>
        <Link to="/admin/products" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-display text-sm text-dairy-900">Manage Products</p>
          <p className="mt-1 text-xs text-ink/55">Add, edit and update stock</p>
        </Link>
        <Link to="/admin/delivery" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-display text-sm text-dairy-900">Delivery Team</p>
          <p className="mt-1 text-xs text-ink/55">Approve delivery partners</p>
        </Link>
      </div>
    </div>
  );
}
