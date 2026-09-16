import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { getProducts, deleteProduct, toggleProductAvailability } from "../../api/productApi";
import { fileUrl } from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import { useToast } from "../../context/ToastContext";
import { usePortalBase } from "../../utils/usePortalBase";
import SearchBar from "../../components/customer/SearchBar";
import Pagination from "../../components/common/Pagination";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function AdminProducts() {
  const toast = useToast();
  const basePath = usePortalBase();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ pages: 1 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts({ search: search || undefined, page, limit: 12, lang: "en" })
      .then((res) => {
        setProducts(res.data.products);
        setMeta({ pages: res.data.pages });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, page]);

  const handleToggle = async (id) => {
    setBusy(true);
    try {
      await toggleProductAvailability(id);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update product");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteProduct(deleteTarget._id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not delete product");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">Products</h2>
        <Link to={`${basePath}/products/new`} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="mb-5 max-w-sm">
        <SearchBar
          value={search}
          onSearch={(q) => {
            setSearch(q);
            setPage(1);
          }}
          placeholder="Search products…"
        />
      </div>

      {loading ? (
        <PageLoader label="Loading products" />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Add your first product to get started." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-dairy-100 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dairy-100">
              {products.map((p) => {
                const img = p.images?.find((i) => i.isPrimary) || p.images?.[0];
                return (
                  <tr key={p._id} className="hover:bg-dairy-50/50">
                    <td className="flex items-center gap-3 px-5 py-3">
                      {img ? (
                        <img src={fileUrl(img.url)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-dairy-100" />
                      )}
                      <span className="line-clamp-1 font-medium text-ink">{p.name}</span>
                    </td>
                    <td className="px-5 py-3 text-ink/60">{p.categoryLabel}</td>
                    <td className="px-5 py-3 text-ink/70">{formatCurrency(p.discountPrice || p.price)}</td>
                    <td className="px-5 py-3 text-ink/70">{p.stock}</td>
                    <td className="px-5 py-3">
                      <span className={`pill ${p.isAvailable ? "bg-leaf-500/10 text-leaf-600" : "bg-clay-500/10 text-clay-600"}`}>
                        {p.isAvailable ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleToggle(p._id)} disabled={busy} className="rounded-lg p-2 text-dairy-600 hover:bg-dairy-50" title="Toggle availability">
                          {p.isAvailable ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                        </button>
                        <Link to={`${basePath}/products/${p._id}/edit`} className="rounded-lg p-2 text-dairy-600 hover:bg-dairy-50" title="Edit">
                          <HiOutlinePencilSquare className="h-4 w-4" />
                        </Link>
                        <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-2 text-clay-500 hover:bg-clay-500/5" title="Delete">
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={meta.pages} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently remove the product from your store."
        confirmLabel="Delete"
        tone="danger"
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
