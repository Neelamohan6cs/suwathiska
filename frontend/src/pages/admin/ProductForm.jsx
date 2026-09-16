import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCloudArrowUp } from "react-icons/hi2";
import { getProductById, createProduct, updateProduct } from "../../api/productApi";
import { fileUrl } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { usePortalBase } from "../../utils/usePortalBase";
import { CATEGORY_LABELS, SUITABLE_FOR_OPTIONS } from "../../utils/constants";
import PageLoader from "../../components/common/PageLoader";

const emptyBilingual = { en: "", ta: "" };

const initialState = {
  productId: "",
  sku: "",
  name: { ...emptyBilingual },
  shortDescription: { ...emptyBilingual },
  description: { ...emptyBilingual },
  category: "cattle_feed",
  brand: { ...emptyBilingual },
  weightValue: "",
  weightUnit: "kg",
  price: "",
  discountPrice: "",
  gst: "",
  stock: "",
  minOrderQty: "1",
  expiryMonths: "6",
  feedingGuide: { ...emptyBilingual },
  storageInstructions: { ...emptyBilingual },
  manufacturer: { ...emptyBilingual },
  tags: "",
  suitableFor: [],
  isAvailable: true,
  isFeatured: false,
  nutrition: { protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", moisture: "" },
};

export default function ProductForm() {
  const { productId: editId } = useParams();
  const isEdit = Boolean(editId);
  const navigate = useNavigate();
  const toast = useToast();
  const basePath = usePortalBase();

  const [form, setForm] = useState(initialState);
  const [ingredients, setIngredients] = useState([{ en: "", ta: "" }]);
  const [benefits, setBenefits] = useState([{ en: "", ta: "" }]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }
    let active = true;
    Promise.all([getProductById(editId, { lang: "en" }), getProductById(editId, { lang: "ta" })])
      .then(([enRes, taRes]) => {
        if (!active) return;
        const p = enRes.data.product;
        const pTa = taRes.data.product;
        setForm({
          productId: p.productId || "",
          sku: p.sku || "",
          name: { en: p.name || "", ta: pTa.name || "" },
          shortDescription: { en: p.shortDescription || "", ta: pTa.shortDescription || "" },
          description: { en: p.description || "", ta: pTa.description || "" },
          category: p.category,
          brand: { en: p.brand || "", ta: pTa.brand || "" },
          weightValue: p.weight?.value || "",
          weightUnit: p.weight?.unit || "kg",
          price: p.price,
          discountPrice: p.discountPrice || "",
          gst: p.gst || "",
          stock: p.stock,
          minOrderQty: p.minOrderQty || 1,
          expiryMonths: p.expiryMonths || 6,
          feedingGuide: { en: p.feedingGuide || "", ta: pTa.feedingGuide || "" },
          storageInstructions: { en: p.storageInstructions || "", ta: pTa.storageInstructions || "" },
          manufacturer: { en: p.manufacturer || "", ta: pTa.manufacturer || "" },
          tags: (p.tags || []).join(", "),
          suitableFor: p.suitableFor || [],
          isAvailable: p.isAvailable,
          isFeatured: p.isFeatured,
          nutrition: {
            protein: p.nutrition?.protein ?? "",
            fat: p.nutrition?.fat ?? "",
            fiber: p.nutrition?.fiber ?? "",
            calcium: p.nutrition?.calcium ?? "",
            phosphorus: p.nutrition?.phosphorus ?? "",
            moisture: p.nutrition?.moisture ?? "",
          },
        });
        setIngredients(p.ingredients?.length ? p.ingredients.map((en, i) => ({ en, ta: pTa.ingredients?.[i] || "" })) : [{ en: "", ta: "" }]);
        setBenefits(p.benefits?.length ? p.benefits.map((en, i) => ({ en, ta: pTa.benefits?.[i] || "" })) : [{ en: "", ta: "" }]);
        setExistingImages(p.images || []);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [editId, isEdit]);

  const setBilingual = (field, langKey, value) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [langKey]: value } }));

  const toggleSuitable = (option) =>
    setForm((f) => ({
      ...f,
      suitableFor: f.suitableFor.includes(option)
        ? f.suitableFor.filter((s) => s !== option)
        : [...f.suitableFor, option],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.sku || !form.name.en || !form.name.ta || !form.price) {
      toast.error("Product ID, SKU, name (English & Tamil) and price are required");
      return;
    }

    const fd = new FormData();
    fd.append("productId", form.productId);
    fd.append("sku", form.sku);
    fd.append("name", JSON.stringify(form.name));
    fd.append("shortDescription", JSON.stringify(form.shortDescription));
    fd.append("description", JSON.stringify(form.description));
    fd.append("category", form.category);
    fd.append("brand", JSON.stringify(form.brand));
    fd.append("weight", JSON.stringify({ value: Number(form.weightValue) || 0, unit: form.weightUnit }));
    fd.append("price", form.price);
    fd.append("discountPrice", form.discountPrice || 0);
    fd.append("gst", form.gst || 0);
    fd.append("stock", form.stock || 0);
    fd.append("minOrderQty", form.minOrderQty || 1);
    fd.append("expiryMonths", form.expiryMonths || 6);
    fd.append("feedingGuide", JSON.stringify(form.feedingGuide));
    fd.append("storageInstructions", JSON.stringify(form.storageInstructions));
    fd.append("manufacturer", JSON.stringify(form.manufacturer));
    fd.append(
      "tags",
      JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean))
    );
    fd.append("suitableFor", JSON.stringify(form.suitableFor));
    fd.append("isAvailable", form.isAvailable);
    fd.append("isFeatured", form.isFeatured);
    fd.append(
      "nutrition",
      JSON.stringify(
        Object.fromEntries(Object.entries(form.nutrition).map(([k, v]) => [k, Number(v) || 0]))
      )
    );
    fd.append(
      "ingredients",
      JSON.stringify(ingredients.filter((i) => i.en || i.ta))
    );
    fd.append("benefits", JSON.stringify(benefits.filter((b) => b.en || b.ta)));

    images.forEach((file) => fd.append("images", file));
    videos.forEach((file) => fd.append("videos", file));

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(editId, fd);
        toast.success("Product updated successfully");
      } else {
        await createProduct(fd);
        toast.success("Product created successfully");
      }
      navigate(`${basePath}/products`);
    } catch (err) {
      toast.error(err.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading product" />;

  const bilingualRow = (label, field, textarea) => (
    <div>
      <label className="label">{label}</label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {textarea ? (
          <textarea
            rows={3}
            placeholder="English"
            className="input"
            value={form[field].en}
            onChange={(e) => setBilingual(field, "en", e.target.value)}
          />
        ) : (
          <input
            placeholder="English"
            className="input"
            value={form[field].en}
            onChange={(e) => setBilingual(field, "en", e.target.value)}
          />
        )}
        {textarea ? (
          <textarea
            rows={3}
            placeholder="தமிழ்"
            className="input"
            value={form[field].ta}
            onChange={(e) => setBilingual(field, "ta", e.target.value)}
          />
        ) : (
          <input
            placeholder="தமிழ்"
            className="input"
            value={form[field].ta}
            onChange={(e) => setBilingual(field, "ta", e.target.value)}
          />
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-dairy-900">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save Product"}
        </button>
      </div>

      <div className="card space-y-4 p-5">
        <h3 className="font-display text-sm text-dairy-900">Basic Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Product ID</label>
            <input className="input" disabled={isEdit} value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} />
          </div>
          <div>
            <label className="label">SKU</label>
            <input className="input" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        {bilingualRow("Product Name", "name")}
        {bilingualRow("Short Description", "shortDescription")}
        {bilingualRow("Full Description", "description", true)}
        {bilingualRow("Brand", "brand")}
      </div>

      <div className="card space-y-4 p-5">
        <h3 className="font-display text-sm text-dairy-900">Pricing &amp; Stock</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Price (₹)</label>
            <input type="number" min="0" className="input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <label className="label">Discount Price (₹)</label>
            <input type="number" min="0" className="input" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} />
          </div>
          <div>
            <label className="label">GST (%)</label>
            <input type="number" min="0" className="input" value={form.gst} onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))} />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          </div>
          <div>
            <label className="label">Min Order Qty</label>
            <input type="number" min="1" className="input" value={form.minOrderQty} onChange={(e) => setForm((f) => ({ ...f, minOrderQty: e.target.value }))} />
          </div>
          <div>
            <label className="label">Weight value</label>
            <input type="number" min="0" className="input" value={form.weightValue} onChange={(e) => setForm((f) => ({ ...f, weightValue: e.target.value }))} />
          </div>
          <div>
            <label className="label">Weight unit</label>
            <input className="input" value={form.weightUnit} onChange={(e) => setForm((f) => ({ ...f, weightUnit: e.target.value }))} />
          </div>
          <div>
            <label className="label">Shelf life (months)</label>
            <input type="number" min="0" className="input" value={form.expiryMonths} onChange={(e) => setForm((f) => ({ ...f, expiryMonths: e.target.value }))} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" className="accent-dairy-600" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} />
            Available for sale
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" className="accent-dairy-600" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
            Featured product
          </label>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h3 className="font-display text-sm text-dairy-900">Media</h3>
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img, i) => (
              <img key={i} src={fileUrl(img.url)} alt="" className="h-20 w-20 rounded-lg object-cover" />
            ))}
          </div>
        )}
        <div>
          <label className="label">Add images</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-dairy-300 px-4 py-3 text-sm text-dairy-600">
            <HiOutlineCloudArrowUp className="h-4.5 w-4.5" />
            {images.length ? `${images.length} image(s) selected` : "Choose image files"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages(Array.from(e.target.files))} />
          </label>
        </div>
        <div>
          <label className="label">Add videos</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-dairy-300 px-4 py-3 text-sm text-dairy-600">
            <HiOutlineCloudArrowUp className="h-4.5 w-4.5" />
            {videos.length ? `${videos.length} video(s) selected` : "Choose video files"}
            <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => setVideos(Array.from(e.target.files))} />
          </label>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h3 className="font-display text-sm text-dairy-900">Nutrition (per unit)</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.keys(form.nutrition).map((key) => (
            <div key={key}>
              <label className="label capitalize">{key}</label>
              <input
                type="number"
                className="input"
                value={form.nutrition[key]}
                onChange={(e) => setForm((f) => ({ ...f, nutrition: { ...f.nutrition, [key]: e.target.value } }))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm text-dairy-900">Ingredients</h3>
          <button type="button" onClick={() => setIngredients((l) => [...l, { en: "", ta: "" }])} className="flex items-center gap-1 text-sm font-semibold text-dairy-600">
            <HiOutlinePlus className="h-4 w-4" /> Add row
          </button>
        </div>
        {ingredients.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input className="input" placeholder="English" value={row.en} onChange={(e) => setIngredients((l) => l.map((r, i) => (i === idx ? { ...r, en: e.target.value } : r)))} />
            <input className="input" placeholder="தமிழ்" value={row.ta} onChange={(e) => setIngredients((l) => l.map((r, i) => (i === idx ? { ...r, ta: e.target.value } : r)))} />
            <button type="button" onClick={() => setIngredients((l) => l.filter((_, i) => i !== idx))} className="flex h-10 w-10 items-center justify-center rounded-lg text-clay-500 hover:bg-clay-500/5">
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm text-dairy-900">Benefits</h3>
          <button type="button" onClick={() => setBenefits((l) => [...l, { en: "", ta: "" }])} className="flex items-center gap-1 text-sm font-semibold text-dairy-600">
            <HiOutlinePlus className="h-4 w-4" /> Add row
          </button>
        </div>
        {benefits.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input className="input" placeholder="English" value={row.en} onChange={(e) => setBenefits((l) => l.map((r, i) => (i === idx ? { ...r, en: e.target.value } : r)))} />
            <input className="input" placeholder="தமிழ்" value={row.ta} onChange={(e) => setBenefits((l) => l.map((r, i) => (i === idx ? { ...r, ta: e.target.value } : r)))} />
            <button type="button" onClick={() => setBenefits((l) => l.filter((_, i) => i !== idx))} className="flex h-10 w-10 items-center justify-center rounded-lg text-clay-500 hover:bg-clay-500/5">
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="card space-y-4 p-5">
        <h3 className="font-display text-sm text-dairy-900">More Details</h3>
        {bilingualRow("Feeding Guide", "feedingGuide", true)}
        {bilingualRow("Storage Instructions", "storageInstructions", true)}
        {bilingualRow("Manufacturer", "manufacturer")}
        <div>
          <label className="label">Suitable for</label>
          <div className="flex flex-wrap gap-2">
            {SUITABLE_FOR_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => toggleSuitable(opt)}
                className={`pill ${form.suitableFor.includes(opt) ? "bg-dairy-600 text-white" : "bg-dairy-50 text-dairy-700"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Tags (comma separated)</label>
          <input className="input" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="pellets, protein-rich, monsoon-feed" />
        </div>
      </div>
    </form>
  );
}
