import { useEffect, useState } from "react";
import { useRouter } from "../lib/router";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../lib/data";
import type { AppNotification } from "../lib/types";
import { Spinner, EmptyState, Card } from "../components/ui";

export default function Notifications() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data as AppNotification[]) || []);
      setLoading(false);
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    })();
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl animate-fade">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications 🔔</h1>
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon="🔔" title="No notifications" desc="Updates about your orders & account appear here." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                <span className="whitespace-nowrap text-xs text-slate-400">{timeAgo(n.created_at)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
