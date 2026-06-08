import { useEffect, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { supabase } from "../lib/supabase";
import {
  fetchProduct,
  fetchReviews,
  money,
  typeLabel,
} from "../lib/data";
import type { Product, Review } from "../lib/types";
import { aiChat } from "../lib/ai";
import { Button, Spinner, Badge, Stars, Card } from "../components/ui";
import { TypeIcon } from "../components/Icons";
import CheckoutModal from "../components/CheckoutModal";

export default function ProductDetail({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [checkout, setCheckout] = useState(false);
  const [owned, setOwned] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [promptOut, setPromptOut] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProduct(id).then(async (p) => {
      setProduct(p);
      setLoading(false);
      if (p) {
        supabase
          .from("products")
          .update({ views: (p.views || 0) + 1 })
          .eq("id", id)
          .then(() => {});
        fetchReviews(id).then(setReviews);
        if (user) {
          const { data } = await supabase
            .from("orders")
            .select("id")
            .eq("buyer_id", user.id)
            .eq("product_id", id)
            .eq("status", "approved")
            .maybeSingle();
          setOwned(!!data);
        }
      }
    });
  }, [id, user]);

  async function runPrompt() {
    if (!promptInput.trim()) return;
    setPromptLoading(true);
    const out = await aiChat([
      {
        role: "system",
        content:
          "You are demonstrating an AI prompt product. Respond helpfully and impressively.",
      },
      { role: "user", content: promptInput },
    ]);
    setPromptOut(out);
    setPromptLoading(false);
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );

  if (!product)
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Product not found.</p>
        <Link to="/explore" className="mt-3 inline-block text-indigo-500">
          ← Back to Explore
        </Link>
      </div>
    );

  const images = [product.cover_url, ...(product.gallery || [])].filter(Boolean);

  return (
    <div className="animate-fade">
      <button
        onClick={() => navigate("/explore")}
        className="mb-4 text-sm font-semibold text-slate-500 hover:text-indigo-500"
      >
        ← Back
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: gallery + details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={product.title}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center text-indigo-300 dark:text-slate-600">
                <TypeIcon type={product.type} className="h-20 w-20" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImg === i ? "border-indigo-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div>
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
              {product.description || product.short_desc}
            </p>
          </div>

          {product.whats_included && (
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                📦 What you'll get
              </h2>
              <ul className="space-y-2">
                {product.whats_included.split("\n").filter(Boolean).map((line, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <span className="text-emerald-500">✓</span> {line}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {product.type === "prompt_pack" && (
            <Card className="border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                🧪 Try a live AI demo
              </h2>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Type a sample prompt to test this AI pack..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                rows={2}
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={runPrompt}
                disabled={promptLoading}
              >
                {promptLoading ? "Generating..." : "Run demo"}
              </Button>
              {promptOut && (
                <div className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {promptOut}
                </div>
              )}
            </Card>
          )}

          {product.preview_text && (
            <Card className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Preview sample
                </h2>
                <Badge color="amber">Watermarked</Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">
                {product.preview_text}
              </p>
            </Card>
          )}

          {/* Reviews */}
          <div>
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400">
                No reviews yet. Reviews appear after verified purchases.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        @{r.buyer?.username || "buyer"}
                      </span>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {r.comment}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: buy box */}
        <div className="space-y-4">
          <Card className="sticky top-20 p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge>
                <TypeIcon type={product.type} className="h-3.5 w-3.5" /> {typeLabel(product.type)}
              </Badge>
              {product.is_recurring && <Badge color="amber">Subscription</Badge>}
            </div>
            <h1 className="text-2xl font-extrabold leading-tight text-slate-900 dark:text-white">
              {product.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {product.short_desc}
            </p>

            <Link
              to={`/@${product.creator?.username}`}
              className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                {(product.creator?.username || "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  @{product.creator?.username}
                </p>
                <p className="text-xs text-slate-400">View storefront →</p>
              </div>
            </Link>

            <div className="my-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {Number(product.price) === 0 ? "Free" : money(product.price)}
              </span>
              {product.is_recurring && (
                <span className="text-sm text-slate-400">/ period</span>
              )}
            </div>

            {owned ? (
              <Link to="/library">
                <Button className="w-full" size="lg">
                  ✓ In your library — Open
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  if (!user) {
                    toast("Please sign in to purchase", "info");
                    navigate("/auth");
                  } else setCheckout(true);
                }}
              >
                Get this product
              </Button>
            )}

            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <p className="flex items-center gap-2">💳 Pay externally, upload proof</p>
              <p className="flex items-center gap-2">⚡ Instant access after admin approval</p>
              <p className="flex items-center gap-2">🔒 Secure & verified delivery</p>
            </div>
          </Card>
        </div>
      </div>

      {checkout && product && (
        <CheckoutModal
          product={product}
          onClose={() => setCheckout(false)}
          onDone={() => {
            setCheckout(false);
            navigate("/orders");
          }}
        />
      )}
    </div>
  );
}
