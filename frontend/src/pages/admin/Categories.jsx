import { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineTag } from "react-icons/hi2";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../api/categoryApi";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { fileUrl } from "../../api/axios";

const emptyForm = { name: { en: "", ta: "" }, description: { en: "", ta: "" }, image: "", isActive: true };

export default function AdminCategories() {
  const { role } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCategories()
      .then((res) => setCategories(res.data.categories))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || { en: "", ta: "" },
      image: category.image || "",
      isActive: category.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.en || !form.name.ta) {
      toast.error("Category name is required in English and Tamil");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing._id, form);
        toast.success("Category updated");
      } else {
        await createCategory(form);
        toast.success("Category created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteCategory(deleteTarget._id);
      toast.success("Category deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not delete category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">Categories</h2>
        <button onClick={openCreate} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <PageLoader label="Loading categories" />
      ) : categories.length === 0 ? (
        <EmptyState icon={<HiOutlineTag />} title="No categories yet" description="Create a category to organize products for shoppers." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat._id} className="card flex items-center gap-3 p-4">
              {cat.image ? (
                <img src={fileUrl(cat.image)} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-dairy-50 text-dairy-400">
                  <HiOutlineTag className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium text-ink">{cat.name.en}</p>
                <p className="line-clamp-1 text-xs text-ink/50">{cat.name.ta}</p>
              </div>
              <span className={`pill ${cat.isActive ? "bg-leaf-500/10 text-leaf-600" : "bg-clay-500/10 text-clay-600"}`}>
                {cat.isActive ? "Active" : "Hidden"}
              </span>
              <button onClick={() => openEdit(cat)} className="rounded-lg p-2 text-dairy-600 hover:bg-dairy-50">
                <HiOutlinePencilSquare className="h-4 w-4" />
              </button>
              {role === "admin" && (
                <button onClick={() => setDeleteTarget(cat)} className="rounded-lg p-2 text-clay-500 hover:bg-clay-500/5">
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4 py-8">
          <form onSubmit={handleSubmit} className="w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6 shadow-card" style={{ maxHeight: "90vh" }}>
            <h3 className="mb-4 font-display text-lg text-dairy-900">{editing ? "Edit Category" : "Add Category"}</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Name (English)</label>
                <input className="input" value={form.name.en} onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, en: e.target.value } }))} />
              </div>
              <div>
                <label className="label">Name (Tamil)</label>
                <input className="input" value={form.name.ta} onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, ta: e.target.value } }))} />
              </div>
              <div>
                <label className="label">Description (English)</label>
                <textarea rows={2} className="input" value={form.description.en} onChange={(e) => setForm((f) => ({ ...f, description: { ...f.description, en: e.target.value } }))} />
              </div>
              <div>
                <label className="label">Description (Tamil)</label>
                <textarea rows={2} className="input" value={form.description.ta} onChange={(e) => setForm((f) => ({ ...f, description: { ...f.description, ta: e.target.value } }))} />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://…" />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" className="accent-dairy-600" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active (visible to customers)
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name?.en}"?`}
        confirmLabel="Delete"
        tone="danger"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
