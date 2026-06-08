import { useEffect, useState } from "react";
import { useRouter } from "../lib/router";
import { supabase } from "../lib/supabase";
import { fetchProducts } from "../lib/data";
import type { Product, Profile } from "../lib/types";
import ProductCard from "../components/ProductCard";
import { Spinner, EmptyState, Stars } from "../components/ui";

export default function Storefront({ username }: { username: string }) {
  const { navigate } = useRouter();
  const [creator, setCreator] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (!data) {
        setLoading(false);
        return;
      }
      setCreator(data as Profile);
      const p = await fetchProducts({ creatorId: data.id, status: "published" });
      setProducts(p);
      setLoading(false);
    })();
  }, [username]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );

  if (!creator)
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Storefront not found.</p>
        <button onClick={() => navigate("/explore")} className="mt-3 text-indigo-500">
          ← Explore
        </button>
      </div>
    );

  const totalSales = products.reduce((a, p) => a + (p.rating_count || 0), 0);
  const avgRating =
    products.filter((p) => p.rating_count).reduce((a, p) => a + p.rating, 0) /
    (products.filter((p) => p.rating_count).length || 1);

  return (
    <div className="animate-fade">
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
        <div
          className="h-40 bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600"
          style={creator.banner_url ? { backgroundImage: `url(${creator.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        />
        <div className="bg-white px-6 pb-6 dark:bg-slate-900">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-500 to-violet-600 dark:border-slate-900">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl font-black text-white">
                  {(creator.full_name || creator.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {creator.full_name || creator.username}
              </h1>
              <p className="text-sm text-slate-500">@{creator.username}</p>
            </div>
            <div className="flex gap-6 pb-1 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{products.length}</p>
                <p className="text-xs text-slate-400">Products</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{totalSales}</p>
                <p className="text-xs text-slate-400">Reviews</p>
              </div>
              <div>
                <div className="flex items-center justify-center"><Stars value={avgRating} /></div>
                <p className="text-xs text-slate-400">Rating</p>
              </div>
            </div>
          </div>
          {creator.bio && (
            <p className="mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{creator.bio}</p>
          )}
          {creator.links && (
            <div className="mt-3 flex flex-wrap gap-2">
              {creator.links.split("\n").filter(Boolean).map((l, i) => (
                <a key={i} href={l} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-slate-800 dark:text-indigo-300">
                  🔗 {l.replace(/^https?:\/\//, "").slice(0, 24)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-bold text-slate-900 dark:text-white">Products</h2>
      {products.length === 0 ? (
        <EmptyState icon="🛍️" title="No products yet" desc="This creator hasn't published anything." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
