import { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlineTruck } from "react-icons/hi2";
import {
  getDeliveryPersons,
  createDeliveryAccount,
  updateDeliveryPersonStatus,
  getDeliveryPersonOrders,
} from "../../api/adminApi";
import { formatCurrency } from "../../utils/format";
import { useToast } from "../../context/ToastContext";
import StatusBadge from "../../components/admin/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";

const emptyForm = { name: "", email: "", phone: "", password: "" };

export default function AdminDelivery() {
  const toast = useToast();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [viewOrders, setViewOrders] = useState([]);

  const load = () => {
    setLoading(true);
    getDeliveryPersons()
      .then((res) => setPeople(res.data.deliveryPersons))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDeliveryAccount(form);
      toast.success("Delivery account created");
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.message || "Could not create account");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateDeliveryPersonStatus(id, status);
      toast.success(`Marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update status");
    }
  };

  const openOrders = async (person) => {
    setViewing(person);
    const res = await getDeliveryPersonOrders(person._id);
    setViewOrders(res.data.deliveries);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">Delivery Team</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" /> Add Delivery Account
        </button>
      </div>

      {loading ? (
        <PageLoader label="Loading delivery team" />
      ) : people.length === 0 ? (
        <EmptyState icon={<HiOutlineTruck />} title="No delivery partners yet" description="Add a delivery account to start assigning orders." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-dairy-100 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dairy-100">
              {people.map((p) => (
                <tr key={p._id} className="hover:bg-dairy-50/50">
                  <td className="px-5 py-3.5">
                    <button onClick={() => openOrders(p)} className="font-medium text-dairy-700 hover:underline">{p.name}</button>
                  </td>
                  <td className="px-5 py-3.5 text-ink/60">{p.email} · {p.phone}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      {p.status !== "approved" && (
                        <button onClick={() => handleStatus(p._id, "approved")} className="pill bg-leaf-500/10 text-leaf-600">Approve</button>
                      )}
                      {p.status !== "blocked" && (
                        <button onClick={() => handleStatus(p._id, "blocked")} className="pill bg-clay-500/10 text-clay-600">Block</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-display text-lg text-dairy-900">Add Delivery Account</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input required type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input required className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="label">Temporary password</label>
                <input required type="password" className="input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Creating…" : "Create Account"}</button>
            </div>
          </form>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4 py-8">
          <div className="w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6 shadow-card" style={{ maxHeight: "85vh" }}>
            <h3 className="font-display text-lg text-dairy-900">{viewing.name}'s deliveries</h3>
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {viewOrders.length === 0 ? (
                <p className="text-sm text-ink/50">No deliveries assigned yet.</p>
              ) : (
                viewOrders.map((d) => (
                  <div key={d._id} className="flex items-center justify-between rounded-lg bg-dairy-50/60 px-3 py-2 text-sm">
                    <span>#{d.order?.orderId}</span>
                    <span>{formatCurrency(d.order?.totalAmount)}</span>
                    <StatusBadge status={d.status} />
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setViewing(null)} className="btn-secondary mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
