import { HiOutlineSquares2X2, HiOutlineCube, HiOutlineTag, HiOutlineArchiveBox } from "react-icons/hi2";
import PortalShell from "../components/admin/PortalShell";
import { ProtectedRoleRoute } from "../components/common/ProtectedRoute";

const navItems = [
  { to: "/manager", label: "Dashboard", icon: HiOutlineSquares2X2, end: true },
  { to: "/manager/products", label: "Products", icon: HiOutlineCube },
  { to: "/manager/categories", label: "Categories", icon: HiOutlineTag },
  { to: "/manager/inventory", label: "Inventory", icon: HiOutlineArchiveBox },
];

export default function ManagerLayout() {
  return (
    <ProtectedRoleRoute role="manager" loginPath="/manager/login">
      <PortalShell title="Suwasthika Dairy Manager" roleLabel="Manager" navItems={navItems} />
    </ProtectedRoleRoute>
  );
}
