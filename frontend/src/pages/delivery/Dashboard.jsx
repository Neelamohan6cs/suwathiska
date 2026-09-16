import { useEffect, useState } from "react";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { getDeliveryDashboard } from "../../api/deliveryApi";
import StatCard from "../../components/admin/StatCard";
import PageLoader from "../../components/common/PageLoader";

export default function DeliveryDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDeliveryDashboard().then((res) => setData(res.data));
  }, []);

  if (!data) return <PageLoader label="Loading dashboard" />;

  return (
    <div>
      <h2 className="mb-6 text-xl text-dairy-900">Your Deliveries</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Assigned" value={data.totalAssigned} icon={HiOutlineClipboardDocumentList} />
        <StatCard label="Pending" value={data.pendingDeliveries} icon={HiOutlineClock} tone="text-wheat-600 bg-wheat-100" />
        <StatCard label="Out for Delivery" value={data.outForDelivery} icon={HiOutlineTruck} />
        <StatCard label="Delivered" value={data.delivered} icon={HiOutlineCheckCircle} tone="text-leaf-600 bg-leaf-500/10" />
        <StatCard label="Today's Deliveries" value={data.todaysDeliveries} icon={HiOutlineCalendarDays} />
      </div>
    </div>
  );
}
