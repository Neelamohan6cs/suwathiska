import { HiOutlineSquares2X2, HiOutlineTruck } from "react-icons/hi2";
import PortalShell from "../components/admin/PortalShell";
import { ProtectedRoleRoute } from "../components/common/ProtectedRoute";

const navItems = [
  { to: "/delivery", label: "Dashboard", icon: HiOutlineSquares2X2, end: true },
  { to: "/delivery/orders", label: "My Deliveries", icon: HiOutlineTruck },
];

export default function DeliveryLayout() {
  return (
    <ProtectedRoleRoute role="delivery" loginPath="/delivery/login">
      <PortalShell title="Suwasthika Dairy Delivery" roleLabel="Delivery Partner" navItems={navItems} />
    </ProtectedRoleRoute>
  );
}
