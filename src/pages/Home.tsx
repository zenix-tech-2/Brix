import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { fetchProducts, PRODUCT_TYPES } from "../lib/data";
import type { Product } from "../lib/types";
import ProductCard from "../components/ProductCard";
import { Button, Spinner, EmptyState } from "../components/ui";
import { TypeIcon } from "../components/Icons";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ sort: "newest" }).then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const trending = [...products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 8);
  const newest = products.slice(0, 8);

  return (
    <div className="space-y-12 animate-fade">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white shadow-2xl shadow-indigo-500/30 sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            🚀 2026 Launch-Ready · Secure manual payments
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            The elevated hub for digital tools & AI assets
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-indigo-100 sm:text-lg">
            Discover templates, AI prompt packs, courses, presets & more. Pay
            securely, upload proof, get instant access after approval.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/explore">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                Explore Marketplace
              </Button>
            </Link>
            <Link to="/sell">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Browse by category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {PRODUCT_TYPES.map((t) => (
            <Link
              key={t.value}
              to={`/explore?type=${t.value}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-500 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-300">
                <TypeIcon type={t.value} className="h-6 w-6" />
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon="🪄"
          title="No products yet"
          desc="Be the first creator to list a product on Brixnode!"
          action={
            <Link to="/sell">
              <Button>Become a Creator</Button>
            </Link>
          }
        />
      ) : (
        <>
          {featured.length > 0 && (
            <Section title="⭐ Featured collections" link="/explore">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Section>
          )}
          <Section title="🔥 Trending now" link="/explore?sort=rating">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Section>
          <Section title="🆕 Fresh arrivals" link="/explore">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Section>
        </>
      )}

      {/* How it works */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          How Brixnode works
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          {[
            ["1", "🔎", "Discover", "Browse rich previews, demos & galleries."],
            ["2", "💳", "Pay externally", "Use bank, PayPal, crypto or local methods."],
            ["3", "📤", "Upload proof", "Submit your payment screenshot for review."],
            ["4", "✅", "Instant access", "Get approved & unlock your library instantly."],
          ].map(([n, icon, title, desc]) => (
            <div key={n} className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-500/10">
                {icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  link,
  children,
}: {
  title: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <Link
          to={link}
          className="text-sm font-semibold text-indigo-500 hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {children}
      </div>
    </section>
  );
}
