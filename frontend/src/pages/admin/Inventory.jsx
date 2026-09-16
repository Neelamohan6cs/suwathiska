import { useEffect, useState } from "react";
import { HiOutlineArchiveBox, HiOutlinePencilSquare } from "react-icons/hi2";
import { getInventory, updateStock } from "../../api/inventoryApi";
import { useToast } from "../../context/ToastContext";
import { localize } from "../../utils/format";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";

export default function Inventory() {
  const toast = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ currentStock: "", minimumStock: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getInventory()
      .then((res) => setInventory(res.data.inventory))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const statusFor = (item) => {
    if (item.currentStock <= 0) return { label: "Out of Stock", tone: "bg-clay-500/10 text-clay-600" };
    if (item.currentStock <= item.minimumStock) return { label: "Low Stock", tone: "bg-wheat-100 text-wheat-600" };
    return { label: "In Stock", tone: "bg-leaf-500/10 text-leaf-600" };
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ currentStock: item.currentStock, minimumStock: item.minimumStock });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStock(editing.product._id, {
        currentStock: Number(form.currentStock),
        minimumStock: Number(form.minimumStock),
      });
      toast.success("Inventory updated");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update inventory");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading inventory" />;

  return (
    <div>
      <h2 className="mb-5 text-xl text-dairy-900">Inventory</h2>

      {inventory.length === 0 ? (
        <EmptyState icon={<HiOutlineArchiveBox />} title="No inventory records yet" description="Inventory entries appear automatically as products are stocked." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-dairy-100 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Current Stock</th>
                <th className="px-5 py-3 font-medium">Minimum Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dairy-100">
              {inventory.map((item) => {
                const status = statusFor(item);
                return (
                  <tr key={item._id} className="hover:bg-dairy-50/50">
                    <td className="px-5 py-3.5 font-medium text-ink">{localize(item.product?.name, "en")}</td>
                    <td className="px-5 py-3.5 text-ink/70">{item.currentStock}</td>
                    <td className="px-5 py-3.5 text-ink/70">{item.minimumStock}</td>
                    <td className="px-5 py-3.5"><Badge tone={status.tone}>{status.label}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(item)} className="rounded-lg p-2 text-dairy-600 hover:bg-dairy-50">
                        <HiOutlinePencilSquare className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4">
          <form onSubmit={handleSave} className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-display text-lg text-dairy-900">Update stock</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Current stock</label>
                <input type="number" min="0" className="input" value={form.currentStock} onChange={(e) => setForm((f) => ({ ...f, currentStock: e.target.value }))} />
              </div>
              <div>
                <label className="label">Minimum stock threshold</label>
                <input type="number" min="0" className="input" value={form.minimumStock} onChange={(e) => setForm((f) => ({ ...f, minimumStock: e.target.value }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
