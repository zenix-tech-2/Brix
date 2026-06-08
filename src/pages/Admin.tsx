import { useEffect, useState } from "react";
import { useRouter } from "../lib/router";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { supabase } from "../lib/supabase";
import { fetchOrders, money, timeAgo, COMMISSION } from "../lib/data";
import { seedDemo } from "../lib/seed";
import { useAuth as useAuthCtx } from "../lib/auth";
import type { Order, PaymentMethod, ApiKeyConfig, Profile, Product } from "../lib/types";
import { Button, Input, Textarea, Card, Spinner, Badge, EmptyState } from "../components/ui";

const TABS = [
  ["orders", "⏳ Approvals"],
  ["payments", "💳 Payment Methods"],
  ["ai", "🤖 AI Keys"],
  ["payouts", "💰 Payouts"],
  ["users", "👥 Users"],
  ["products", "🧩 Products"],
] as const;

export default function Admin() {
  const { profile, loading } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("orders");

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") navigate("/");
  }, [profile, loading]);

  if (loading)
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  if (!profile || profile.role !== "admin")
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">🔒 Admin access only.</p>
        <p className="mt-2 text-xs text-slate-400">
          Sign in with the admin email configured in src/lib/auth.tsx (admin@brixnode.com).
        </p>
      </div>
    );

  return (
    <div className="animate-fade">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard 🛡️</h1>
      <p className="text-sm text-slate-500">Manage approvals, payments, AI, payouts & users</p>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === k ? "border-indigo-500 text-indigo-600 dark:text-indigo-300" : "border-transparent text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "orders" && <ApprovalsTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "ai" && <AiKeysTab />}
        {tab === "payouts" && <PayoutsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "products" && <ProductsTab />}
      </div>
    </div>
  );
}

/* ---------------- Approvals ---------------- */
function ApprovalsTab() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [viewProof, setViewProof] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const o = await fetchOrders({ status: filter });
    setOrders(o);
    setLoading(false);
  }
  useEffect(() => { load(); }, [filter]);

  async function decide(o: Order, status: "approved" | "rejected", note = "") {
    const { error } = await supabase.from("orders").update({ status, admin_note: note }).eq("id", o.id);
    if (error) { toast(error.message, "error"); return; }
    await supabase.from("notifications").insert({
      user_id: o.buyer_id,
      title: status === "approved" ? "Order approved ✅" : "Order rejected",
      body: status === "approved"
        ? `Your purchase "${o.product?.title}" is now in your library!`
        : `Your order for "${o.product?.title}" was rejected. ${note}`,
    });
    toast(`Order ${status}`, status === "approved" ? "success" : "info");
    load();
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${filter === s ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{s}</button>
        ))}
      </div>
      {loading ? <Spinner /> : orders.length === 0 ? (
        <EmptyState icon="✅" title={`No ${filter} orders`} desc="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                {o.proof_url ? (
                  <button onClick={() => setViewProof(o.proof_url)} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <img src={o.proof_url} alt="proof" className="h-full w-full object-cover" />
                  </button>
                ) : (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">No proof</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">{o.product?.title}</p>
                  <p className="text-sm text-slate-500">Buyer: {o.buyer?.email || o.buyer_id.slice(0, 8)}</p>
                  <p className="text-sm text-slate-500">{o.payment_method} · Ref: {o.payment_reference || "—"}</p>
                  <p className="text-xs text-slate-400">{timeAgo(o.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 dark:text-white">{money(o.amount)}</p>
                </div>
              </div>
              {filter === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => decide(o, "approved")}>✓ Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => { const n = prompt("Rejection reason (optional):") || ""; decide(o, "rejected", n); }}>✕ Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      {viewProof && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4" onClick={() => setViewProof(null)}>
          <img src={viewProof} alt="proof" className="max-h-[90vh] max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

/* ---------------- Payment Methods ---------------- */
const PRESET_METHODS = [
  { icon: "🏦", label: "Bank Transfer" },
  { icon: "🅿️", label: "PayPal" },
  { icon: "₿", label: "Crypto (BTC/USDT)" },
  { icon: "🌍", label: "Wise" },
  { icon: "📱", label: "M-Pesa" },
  { icon: "📲", label: "MTN Mobile Money" },
  { icon: "🟠", label: "Orange Money" },
  { icon: "🟡", label: "Airtel Money" },
  { icon: "💚", label: "Moov Money" },
  { icon: "🇳🇬", label: "Opay / Flutterwave" },
];

function PaymentsTab() {
  const toast = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ label: "", icon: "💳", details: "" });

  async function load() {
    const { data } = await supabase.from("payment_methods").select("*").order("label");
    setMethods((data as PaymentMethod[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.label || !form.details) { toast("Fill label & details", "error"); return; }
    const { error } = await supabase.from("payment_methods").insert({ ...form, active: true });
    if (error) { toast(error.message, "error"); return; }
    toast("Payment method added ✅", "success");
    setForm({ label: "", icon: "💳", details: "" });
    load();
  }
  async function toggle(m: PaymentMethod) {
    await supabase.from("payment_methods").update({ active: !m.active }).eq("id", m.id);
    load();
  }
  async function remove(id: string) {
    await supabase.from("payment_methods").delete().eq("id", id);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-3 p-5">
        <h3 className="font-bold text-slate-900 dark:text-white">Add payment method</h3>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_METHODS.map((p) => (
            <button key={p.label} onClick={() => setForm({ ...form, label: p.label, icon: p.icon })} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold dark:bg-slate-800">{p.icon} {p.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input className="w-20" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Icon" />
          <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Method label" />
        </div>
        <Textarea rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder={"Payment instructions buyers will see, e.g.\nAccount: 1234567890\nName: Brixnode Ltd\nBank: Example Bank"} />
        <Button onClick={add}>Add method</Button>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white">Active methods (shown at checkout)</h3>
        {loading ? <Spinner /> : methods.length === 0 ? (
          <p className="text-sm text-slate-400">No methods yet. Add one so buyers can pay.</p>
        ) : methods.map((m) => (
          <Card key={m.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{m.icon}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{m.label}</span>
                <Badge color={m.active ? "green" : "slate"}>{m.active ? "active" : "hidden"}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(m)}>{m.active ? "Hide" : "Show"}</Button>
                <Button size="sm" variant="danger" onClick={() => remove(m.id)}>Delete</Button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-xs text-slate-500">{m.details}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- AI Keys ---------------- */
function AiKeysTab() {
  const toast = useToast();
  const [keys, setKeys] = useState<ApiKeyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ provider: "OpenAI", key_value: "", model: "gpt-4o-mini" });

  async function load() {
    const { data } = await supabase.from("api_keys").select("*");
    setKeys((data as ApiKeyConfig[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.key_value) { toast("Enter the API key", "error"); return; }
    const { error } = await supabase.from("api_keys").insert({ ...form, active: true });
    if (error) { toast(error.message, "error"); return; }
    toast("AI key saved 🔐", "success");
    setForm({ provider: "OpenAI", key_value: "", model: "gpt-4o-mini" });
    load();
  }
  async function toggle(k: ApiKeyConfig) {
    if (!k.active) await supabase.from("api_keys").update({ active: false }).neq("id", k.id);
    await supabase.from("api_keys").update({ active: !k.active }).eq("id", k.id);
    load();
  }
  async function remove(id: string) {
    await supabase.from("api_keys").delete().eq("id", id);
    load();
  }

  const providers = ["OpenAI", "Grok (xAI)", "Gemini (Google)", "Groq", "Anthropic"];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-3 p-5">
        <h3 className="font-bold text-slate-900 dark:text-white">Add / rotate AI key</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">Provider</label>
          <div className="flex flex-wrap gap-1.5">
            {providers.map((p) => (
              <button key={p} onClick={() => setForm({ ...form, provider: p })} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${form.provider === p ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>{p}</button>
            ))}
          </div>
        </div>
        <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model (e.g. gpt-4o-mini, grok-2, gemini-1.5-flash)" />
        <Input type="password" value={form.key_value} onChange={(e) => setForm({ ...form, key_value: e.target.value })} placeholder="API key (stored server-side)" />
        <Button onClick={add}>Save key</Button>
        <p className="text-xs text-slate-400">Only one key is active at a time for unified routing. Keys power the AI assistant, listing generation & demos.</p>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white">Configured providers</h3>
        {loading ? <Spinner /> : keys.length === 0 ? (
          <p className="text-sm text-slate-400">No keys yet. AI runs in demo mode until you add one.</p>
        ) : keys.map((k) => (
          <Card key={k.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{k.provider}</p>
              <p className="text-xs text-slate-400">Model: {k.model} · Key: ••••{k.key_value.slice(-4)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge color={k.active ? "green" : "slate"}>{k.active ? "active" : "off"}</Badge>
              <Button size="sm" variant="outline" onClick={() => toggle(k)}>{k.active ? "Disable" : "Enable"}</Button>
              <Button size="sm" variant="danger" onClick={() => remove(k.id)}>✕</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Payouts ---------------- */
function PayoutsTab() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const o = await fetchOrders({ status: "approved" });
    setOrders(o);
    const ids = [...new Set(o.map((x) => x.creator_id).filter(Boolean))];
    if (ids.length) {
      const { data } = await supabase.from("profiles").select("*").in("id", ids);
      const map: Record<string, Profile> = {};
      (data || []).forEach((p) => (map[p.id] = p as Profile));
      setProfiles(map);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const byCreator: Record<string, { gross: number; unpaid: number; orders: Order[] }> = {};
  orders.forEach((o) => {
    const c = o.creator_id;
    if (!c) return;
    byCreator[c] = byCreator[c] || { gross: 0, unpaid: 0, orders: [] };
    byCreator[c].gross += Number(o.amount);
    if (o.payout_status !== "processed") byCreator[c].unpaid += Number(o.amount);
    byCreator[c].orders.push(o);
  });

  async function markPaid(creatorId: string) {
    const ids = orders.filter((o) => o.creator_id === creatorId && o.payout_status !== "processed").map((o) => o.id);
    await supabase.from("orders").update({ payout_status: "processed" }).in("id", ids);
    toast("Payout marked processed 💸", "success");
    load();
  }

  if (loading) return <Spinner />;
  const entries = Object.entries(byCreator);
  if (!entries.length) return <EmptyState icon="💰" title="No earnings yet" desc="Approved sales will show payable amounts here." />;

  return (
    <div className="space-y-3">
      {entries.map(([cid, info]) => {
        const p = profiles[cid];
        const net = info.unpaid * (1 - COMMISSION);
        return (
          <Card key={cid} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">@{p?.username || cid.slice(0, 8)}</p>
                <p className="text-sm text-slate-500">{p?.payout_method || "No payout method set"}</p>
                {p?.payout_details && <p className="text-xs text-slate-400">{p.payout_details}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Owed (after {COMMISSION * 100}% fee)</p>
                <p className="text-xl font-black text-emerald-600">{money(net)}</p>
                {info.unpaid > 0 ? (
                  <Button size="sm" className="mt-1" onClick={() => markPaid(cid)}>Mark as paid</Button>
                ) : (
                  <Badge color="green">All paid</Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Users ---------------- */
function UsersTab() {
  const toast = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data as Profile[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setRole(u: Profile, role: string) {
    await supabase.from("profiles").update({ role }).eq("id", u.id);
    toast(`Updated @${u.username} to ${role}`, "success");
    load();
  }
  async function notify(u: Profile) {
    const body = prompt(`Send in-app notification to @${u.username}:`);
    if (!body) return;
    await supabase.from("notifications").insert({ user_id: u.id, title: "Message from Admin", body });
    toast("Notification sent", "success");
  }

  const filtered = users.filter((u) => (u.username || "").includes(q) || (u.email || "").includes(q));

  if (loading) return <Spinner />;
  return (
    <div>
      <Input className="mb-4 max-w-xs" placeholder="🔍 Search users..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="space-y-2">
        {filtered.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">{(u.username || "?").charAt(0).toUpperCase()}</span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">@{u.username}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <Badge color={u.role === "admin" ? "rose" : u.role === "creator" ? "indigo" : "slate"}>{u.role}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setRole(u, u.role === "creator" ? "buyer" : "creator")}>{u.role === "creator" ? "Demote" : "Make creator"}</Button>
              <Button size="sm" variant="soft" onClick={() => notify(u)}>Notify</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Products moderation ---------------- */
function ProductsTab() {
  const toast = useToast();
  const { user } = useAuthCtx();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  async function seed() {
    if (!user) return;
    setSeeding(true);
    const { error } = await seedDemo(user.id);
    if (error) toast(error, "error");
    else toast("Demo products added 🎉", "success");
    setSeeding(false);
    load();
  }

  async function load() {
    const { data } = await supabase.from("products").select("*, creator:profiles(*)").order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(p: Product, status: string) {
    await supabase.from("products").update({ status }).eq("id", p.id);
    toast(`Product ${status}`, "success");
    load();
  }
  async function feature(p: Product) {
    await supabase.from("products").update({ featured: !p.featured }).eq("id", p.id);
    load();
  }

  if (loading) return <Spinner />;
  return (
    <div className="space-y-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-500">{products.length} total products</p>
        <Button size="sm" variant="soft" onClick={seed} disabled={seeding}>
          {seeding ? "Seeding..." : "🎉 Seed demo products"}
        </Button>
      </div>
      {products.length === 0 && (
        <EmptyState icon="🧩" title="No products" desc="Seed demo products or wait for creators to upload." />
      )}
      {products.map((p) => (
        <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {p.cover_url ? <img src={p.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center">📦</div>}
            </div>
            <div>
              <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white">{p.title}</p>
              <p className="text-xs text-slate-400">@{p.creator?.username} · {money(p.price)}</p>
            </div>
            <Badge color={p.status === "published" ? "green" : "amber"}>{p.status}</Badge>
            {p.featured && <Badge color="amber">⭐ featured</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => feature(p)}>{p.featured ? "Unfeature" : "Feature"}</Button>
            {p.status === "published" ? (
              <Button size="sm" variant="danger" onClick={() => setStatus(p, "rejected")}>Unpublish</Button>
            ) : (
              <Button size="sm" onClick={() => setStatus(p, "published")}>Publish</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
