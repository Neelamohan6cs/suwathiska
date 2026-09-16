import {
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineArchiveBox,
  HiOutlineChartBar,
} from "react-icons/hi2";
import PortalShell from "../components/admin/PortalShell";
import { ProtectedRoleRoute } from "../components/common/ProtectedRoute";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: HiOutlineSquares2X2, end: true },
  { to: "/admin/orders", label: "Orders", icon: HiOutlineClipboardDocumentList },
  { to: "/admin/products", label: "Products", icon: HiOutlineCube },
  { to: "/admin/categories", label: "Categories", icon: HiOutlineTag },
  { to: "/admin/customers", label: "Customers", icon: HiOutlineUsers },
  { to: "/admin/delivery", label: "Delivery", icon: HiOutlineTruck },
  { to: "/admin/active-deliveries", label: "Live Tracking", icon: HiOutlineMapPin },
  { to: "/admin/inventory", label: "Inventory", icon: HiOutlineArchiveBox },
  { to: "/admin/reports", label: "Reports", icon: HiOutlineChartBar },
];

export default function AdminLayout() {
  return (
    <ProtectedRoleRoute role="admin" loginPath="/admin/login">
      <PortalShell title="Suwasthika Dairy Admin" roleLabel="Administrator" navItems={navItems} />
    </ProtectedRoleRoute>
  );
}
