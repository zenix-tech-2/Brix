import { useEffect, useState } from "react";
import { useRouter } from "../lib/router";
import { fetchProducts, PRODUCT_TYPES } from "../lib/data";
import type { Product } from "../lib/types";
import ProductCard from "../components/ProductCard";
import { Spinner, EmptyState, Input, Select } from "../components/ui";
import { TypeIcon } from "../components/Icons";

export default function Explore() {
  const { query, navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query.get("search") || "");
  const [type, setType] = useState(query.get("type") || "");
  const [sort, setSort] = useState(query.get("sort") || "newest");
  const [priceMax, setPriceMax] = useState("");

  // Sync filters when the URL query changes (e.g. clicking a category link
  // while already on the Explore page).
  const qsType = query.get("type") || "";
  const qsSearch = query.get("search") || "";
  const qsSort = query.get("sort") || "newest";
  useEffect(() => {
    setType(qsType);
    setSearch(qsSearch);
    setSort(qsSort);
  }, [qsType, qsSearch, qsSort]);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ type: type || undefined, sort, search: search || undefined }).then(
      (p) => {
        setProducts(p);
        setLoading(false);
      }
    );
  }, [type, sort, search]);

  const filtered = products.filter((p) =>
    priceMax ? Number(p.price) <= Number(priceMax) : true
  );

  function updateUrl(next: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = { search, type, sort, ...next };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    navigate(`/explore?${params.toString()}`, { replace: true });
  }

  return (
    <div className="animate-fade">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Explore Marketplace
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {filtered.length} products available
      </p>

      {/* Category quick-switch strip with professional SVG icons */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setType("");
            updateUrl({ type: "" });
          }}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
            type === ""
              ? "bg-indigo-500 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          All
        </button>
        {PRODUCT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setType(t.value);
              updateUrl({ type: t.value });
            }}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              type === t.value
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <TypeIcon type={t.value} className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="🔍 Search products, tags..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateUrl({ search: e.target.value });
          }}
        />
        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            updateUrl({ type: e.target.value });
          }}
        >
          <option value="">All categories</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.icon} {t.label}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            updateUrl({ sort: e.target.value });
          }}
        >
          <option value="newest">Newest</option>
          <option value="rating">Top rated</option>
          <option value="price_low">Price: Low → High</option>
          <option value="price_high">Price: High → Low</option>
        </Select>
        <Input
          type="number"
          placeholder="Max price ($)"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🔍"
            title="No products found"
            desc="Try adjusting your filters or search terms."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
