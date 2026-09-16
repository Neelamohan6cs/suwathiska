import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HiAdjustmentsHorizontal, HiOutlineFaceFrown } from "react-icons/hi2";
import { getProducts } from "../../api/productApi";
import { useLanguage } from "../../context/LanguageContext";
import ProductCard from "../../components/customer/ProductCard";
import FilterSidebar from "../../components/customer/FilterSidebar";
import SearchBar from "../../components/customer/SearchBar";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import { ProductCardSkeleton } from "../../components/common/Skeleton";
import { CATEGORY_LABELS } from "../../utils/constants";

export default function Products() {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minWeight: searchParams.get("minWeight") || "",
      maxWeight: searchParams.get("maxWeight") || "",
      sort: searchParams.get("sort") || "",
      page: Number(searchParams.get("page") || 1),
    }),
    [searchParams]
  );

  const updateFilters = (patch) => {
    const next = { ...filters, ...patch, page: patch.page || 1 };
    const params = {};
    Object.entries(next).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null && !(key === "page" && value === 1)) {
        params[key] = value;
      }
    });
    setSearchParams(params);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = {
      lang,
      search: filters.search || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minWeight: filters.minWeight || undefined,
      maxWeight: filters.maxWeight || undefined,
      sort: filters.sort || undefined,
      page: filters.page,
      limit: 12,
    };
    getProducts(params)
      .then((res) => {
        if (!active) return;
        setProducts(res.data.products);
        setMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [lang, JSON.stringify(filters)]);

  const activeCategoryLabel = filters.category ? CATEGORY_LABELS[filters.category] : null;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl">
          {activeCategoryLabel ? activeCategoryLabel : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          {loading ? "Loading products…" : `${meta.total} product${meta.total === 1 ? "" : "s"} found`}
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <SearchBar value={filters.search} onSearch={(search) => updateFilters({ search })} />
        <button
          onClick={() => setFiltersOpen(true)}
          className="btn-secondary shrink-0 lg:hidden"
        >
          <HiAdjustmentsHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={updateFilters} />
        </aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-cream p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg text-dairy-900">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="btn-secondary px-3 py-1.5 text-xs">
                  Close
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={updateFilters} />
            </div>
          </div>
        )}

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<HiOutlineFaceFrown />}
              title="No products found"
              description="Try adjusting your filters or search for something else."
              action={
                <button className="btn-primary" onClick={() => setSearchParams({})}>
                  Clear all filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination page={meta.page} pages={meta.pages} onChange={(page) => updateFilters({ page })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
