import { useEffect, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { supabase } from "../lib/supabase";
import { fetchOrders, typeLabel } from "../lib/data";
import { TypeIcon } from "../components/Icons";
import type { Order } from "../lib/types";
import { Spinner, EmptyState, Button, Badge, Card, Stars } from "../components/ui";

export default function Library() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reviewFor, setReviewFor] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders({ buyer_id: user.id, status: "approved" }).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [user]);

  const filtered = orders.filter((o) =>
    o.product?.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );

  return (
    <div className="animate-fade">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Brixnode 📚
          </h1>
          <p className="text-sm text-slate-500">
            {orders.length} approved {orders.length === 1 ? "item" : "items"}{" "}
            ready to use
          </p>
        </div>
        {orders.length > 0 && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search library..."
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        )}
      </div>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="📦"
            title="Your library is empty"
            desc="Purchases appear here instantly after admin approval."
            action={
              <Link to="/explore">
                <Button>Explore Marketplace</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <Card key={o.id} className="overflow-hidden">
              <div className="relative aspect-[16/9] bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-slate-800 dark:to-slate-800">
                {o.product?.cover_url ? (
                  <img
                    src={o.product.cover_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-indigo-300 dark:text-slate-600">
                    <TypeIcon type={o.product?.type || "other"} className="h-12 w-12" />
                  </div>
                )}
                <Badge color="green" className="absolute left-2 top-2">
                  ✓ Ready
                </Badge>
              </div>
              <div className="p-4">
                <Badge color="slate">{typeLabel(o.product?.type || "")}</Badge>
                <h3 className="mt-2 line-clamp-1 font-bold text-slate-900 dark:text-white">
                  {o.product?.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to={`/product/${o.product_id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Open
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="soft"
                    onClick={() => setReviewFor(o)}
                  >
                    ★ Review
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reviewFor && (
        <ReviewModal
          order={reviewFor}
          onClose={() => setReviewFor(null)}
          onDone={() => {
            setReviewFor(null);
            toast("Thanks for your review! ⭐", "success");
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({
  order,
  onClose,
  onDone,
}: {
  order: Order;
  onClose: () => void;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: order.product_id,
      buyer_id: user.id,
      rating,
      comment,
    });
    if (error) {
      toast(error.message, "error");
      setSaving(false);
      return;
    }
    // update product aggregate
    const { data: rs } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", order.product_id);
    if (rs) {
      const avg = rs.reduce((a, r) => a + r.rating, 0) / rs.length;
      await supabase
        .from("products")
        .update({ rating: avg, rating_count: rs.length })
        .eq("id", order.product_id);
    }
    setSaving(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Review “{order.product?.title}”
        </h3>
        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`text-3xl ${
                n <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
              }`}
            >
              ★
            </button>
          ))}
          <Stars value={0} size={0} />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Submit review"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
