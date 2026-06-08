import { useEffect, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { useAuth } from "../lib/auth";
import { fetchOrders, money, timeAgo } from "../lib/data";
import type { Order } from "../lib/types";
import { Spinner, EmptyState, Badge, Card, Button } from "../components/ui";

export default function Orders() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders({ buyer_id: user.id }).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );

  const statusBadge = (s: string) =>
    s === "approved" ? (
      <Badge color="green">✓ Approved</Badge>
    ) : s === "rejected" ? (
      <Badge color="rose">✕ Rejected</Badge>
    ) : (
      <Badge color="amber">⏳ Pending approval</Badge>
    );

  return (
    <div className="animate-fade">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        My Orders 🧾
      </h1>
      <p className="text-sm text-slate-500">Track your purchase status & receipts</p>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🧾"
            title="No orders yet"
            desc="Your purchase history will appear here."
            action={
              <Link to="/explore">
                <Button>Start shopping</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                {o.product?.cover_url ? (
                  <img src={o.product.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/product/${o.product_id}`}
                  className="line-clamp-1 font-bold text-slate-900 hover:text-indigo-500 dark:text-white"
                >
                  {o.product?.title || "Product"}
                </Link>
                <p className="text-xs text-slate-400">
                  {o.payment_method} · {timeAgo(o.created_at)}
                </p>
                <div className="mt-1.5">{statusBadge(o.status)}</div>
                {o.status === "rejected" && o.admin_note && (
                  <p className="mt-1 text-xs text-rose-500">Note: {o.admin_note}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">
                  {money(o.amount)}
                </p>
                {o.status === "approved" && (
                  <Link
                    to="/library"
                    className="text-xs font-semibold text-indigo-500 hover:underline"
                  >
                    Open in library →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
