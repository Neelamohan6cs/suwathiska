import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineCube, HiOutlineExclamationTriangle, HiOutlineArchiveBox, HiOutlineTag } from "react-icons/hi2";
import { getProducts } from "../../api/productApi";
import { getInventory } from "../../api/inventoryApi";
import { getCategories } from "../../api/categoryApi";
import StatCard from "../../components/admin/StatCard";
import PageLoader from "../../components/common/PageLoader";

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([getProducts({ limit: 1 }), getInventory(), getCategories()]).then(
      ([productsRes, inventoryRes, categoriesRes]) => {
        const lowStock = inventoryRes.data.inventory.filter(
          (i) => i.currentStock <= i.minimumStock
        ).length;
        setStats({
          totalProducts: productsRes.data.total,
          totalCategories: categoriesRes.data.categories.length,
          lowStock,
        });
      }
    );
  }, []);

  if (!stats) return <PageLoader label="Loading dashboard" />;

  return (
    <div>
      <h2 className="mb-6 text-xl text-dairy-900">Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Products" value={stats.totalProducts} icon={HiOutlineCube} />
        <StatCard label="Categories" value={stats.totalCategories} icon={HiOutlineTag} />
        <StatCard label="Low Stock Items" value={stats.lowStock} icon={HiOutlineExclamationTriangle} tone="text-wheat-600 bg-wheat-100" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/manager/products" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-display text-sm text-dairy-900">Manage Products</p>
          <p className="mt-1 text-xs text-ink/55">Add, edit and update product listings</p>
        </Link>
        <Link to="/manager/inventory" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-display text-sm text-dairy-900">Inventory</p>
          <p className="mt-1 text-xs text-ink/55">Keep stock levels up to date</p>
        </Link>
        <Link to="/manager/categories" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-display text-sm text-dairy-900">Categories</p>
          <p className="mt-1 text-xs text-ink/55">Organize how products are browsed</p>
        </Link>
      </div>
    </div>
  );
}
