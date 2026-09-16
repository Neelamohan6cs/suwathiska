import { CATEGORY_LABELS, SORT_OPTIONS } from "../../utils/constants";

export default function FilterSidebar({ filters, onChange, categories = [] }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  const categoryOptions =
    categories.length > 0
      ? categories
      : Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="card space-y-6 p-5">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-dairy-900">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => set({ category: "" })}
              className="accent-dairy-600"
            />
            All categories
          </label>
          {categoryOptions.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="radio"
                name="category"
                checked={filters.category === c.value}
                onChange={() => set({ category: c.value })}
                className="accent-dairy-600"
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-dairy-900">Price range (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
            className="input"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-dairy-900">Weight (kg)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minWeight}
            onChange={(e) => set({ minWeight: e.target.value })}
            className="input"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxWeight}
            onChange={(e) => set({ maxWeight: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-dairy-900">Sort by</h4>
        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
          className="input"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() =>
          onChange({
            category: "",
            minPrice: "",
            maxPrice: "",
            minWeight: "",
            maxWeight: "",
            sort: "",
            search: filters.search,
          })
        }
        className="btn-secondary w-full"
      >
        Clear filters
      </button>
    </div>
  );
}
