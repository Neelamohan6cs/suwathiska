import { useEffect, useState } from "react";
import { HiOutlineUsers } from "react-icons/hi2";
import { getCustomers, updateCustomerStatus, getCustomerById } from "../../api/adminApi";
import { formatDate, formatCurrency } from "../../utils/format";
import { useToast } from "../../context/ToastContext";
import SearchBar from "../../components/customer/SearchBar";
import StatusBadge from "../../components/admin/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";

const STATUS_TABS = ["", "approved", "pending", "blocked", "rejected"];

export default function AdminCustomers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers({ status: status || undefined, search: search || undefined })
      .then((res) => setCustomers(res.data.customers))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, search]);

  const handleStatusChange = async (id, next) => {
    try {
      await updateCustomerStatus(id, next);
      toast.success(`Customer ${next}`);
      load();
      if (detail?.customer?._id === id) openDetail(id);
    } catch (err) {
      toast.error(err.message || "Could not update customer");
    }
  };

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await getCustomerById(id);
      setDetail(res.data);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">Customers</h2>
        <SearchBar value={search} onSearch={setSearch} placeholder="Search customers…" className="max-w-xs" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`pill capitalize ${status === s ? "bg-dairy-600 text-white" : "bg-dairy-50 text-dairy-700"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading customers" />
      ) : customers.length === 0 ? (
        <EmptyState icon={<HiOutlineUsers />} title="No customers found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-dairy-100 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dairy-100">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-dairy-50/50">
                  <td className="px-5 py-3.5">
                    <button onClick={() => openDetail(c._id)} className="font-medium text-dairy-700 hover:underline">
                      {c.name}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-ink/60">{c.email}</td>
                  <td className="px-5 py-3.5 text-ink/60">{c.phone}</td>
                  <td className="px-5 py-3.5 text-ink/60">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      {c.status !== "approved" && (
                        <button onClick={() => handleStatusChange(c._id, "approved")} className="pill bg-leaf-500/10 text-leaf-600">Approve</button>
                      )}
                      {c.status !== "blocked" && (
                        <button onClick={() => handleStatusChange(c._id, "blocked")} className="pill bg-clay-500/10 text-clay-600">Block</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4 py-8">
          <div className="w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6 shadow-card" style={{ maxHeight: "85vh" }}>
            {detailLoading ? (
              <PageLoader label="Loading" />
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg text-dairy-900">{detail.customer.name}</h3>
                    <p className="text-sm text-ink/55">{detail.customer.email} · {detail.customer.phone}</p>
                  </div>
                  <StatusBadge status={detail.customer.status} />
                </div>
                <h4 className="mb-2 mt-6 text-sm font-semibold text-dairy-900">Orders ({detail.orders.length})</h4>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {detail.orders.length === 0 ? (
                    <p className="text-sm text-ink/50">No orders yet.</p>
                  ) : (
                    detail.orders.map((o) => (
                      <div key={o._id} className="flex items-center justify-between rounded-lg bg-dairy-50/60 px-3 py-2 text-sm">
                        <span>#{o.orderId}</span>
                        <span>{formatCurrency(o.totalAmount)}</span>
                        <StatusBadge status={o.orderStatus} />
                      </div>
                    ))
                  )}
                </div>
                <button onClick={() => setDetail(null)} className="btn-secondary mt-6 w-full">Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
