import { useEffect, useState } from "react";
import { useRouter, Link } from "../lib/router";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { uploadFile } from "../lib/data";
import { Button, Input, Textarea, Card } from "../components/ui";

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    links: "",
    payout_method: "",
    payout_details: "",
    referral_name: "",
    avatar_url: "",
    banner_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        links: profile.links || "",
        payout_method: profile.payout_method || "",
        payout_details: profile.payout_details || "",
        referral_name: profile.referral_name || profile.username || "",
        avatar_url: profile.avatar_url || "",
        banner_url: profile.banner_url || "",
      });
    }
  }, [profile, user]);

  async function save() {
    setSaving(true);
    const { error } = await updateProfile(form);
    if (error) toast(error, "error");
    else toast("Profile saved ✅", "success");
    setSaving(false);
  }

  async function upload(field: "avatar_url" | "banner_url", f: File | null) {
    if (!f) return;
    const up = await uploadFile(f, "avatars");
    if (up.url) {
      setForm((s) => ({ ...s, [field]: up.url! }));
      toast("Image uploaded", "success");
    } else toast("Upload failed (storage bucket missing)", "error");
  }

  if (!profile) return null;

  const referralLink = `${window.location.origin}/?ref=${form.referral_name || profile.username}`;

  return (
    <div className="mx-auto max-w-2xl animate-fade space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Profile & Settings ⚙️
      </h1>

      {/* Banner + avatar */}
      <Card className="overflow-hidden">
        <div
          className="h-32 bg-gradient-to-r from-indigo-500 to-violet-600"
          style={
            form.banner_url
              ? { backgroundImage: `url(${form.banner_url})`, backgroundSize: "cover" }
              : {}
          }
        />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-500 to-violet-600 dark:border-slate-900">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-black text-white">
                  {(form.full_name || form.username || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex gap-2 pb-1">
              <label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Avatar
                <input type="file" accept="image/*" className="hidden" onChange={(e) => upload("avatar_url", e.target.files?.[0] || null)} />
              </label>
              <label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Banner
                <input type="file" accept="image/*" className="hidden" onChange={(e) => upload("banner_url", e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-bold text-slate-900 dark:text-white">Public profile</h2>
        <Field label="Full name">
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </Field>
        <Field label="Username (storefront slug)">
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
          />
          <p className="mt-1 text-xs text-slate-400">brixnode.store/@{form.username}</p>
        </Field>
        <Field label="Bio">
          <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <Field label="Links (one per line)">
          <Textarea rows={2} value={form.links} placeholder="https://twitter.com/you" onChange={(e) => setForm({ ...form, links: e.target.value })} />
        </Field>
        {profile.username && (
          <Link to={`/@${profile.username}`} className="inline-block text-sm font-semibold text-indigo-500 hover:underline">
            🏪 View my storefront →
          </Link>
        )}
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-bold text-slate-900 dark:text-white">💰 Payout details (for creators)</h2>
        <p className="text-sm text-slate-500">
          Admin uses these to send your earnings after manual transfer.
        </p>
        <Field label="Payout method">
          <Input value={form.payout_method} placeholder="PayPal / Bank / Crypto / Wise" onChange={(e) => setForm({ ...form, payout_method: e.target.value })} />
        </Field>
        <Field label="Payout details">
          <Textarea rows={2} value={form.payout_details} placeholder="Account number, wallet address, email..." onChange={(e) => setForm({ ...form, payout_details: e.target.value })} />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-bold text-slate-900 dark:text-white">🎁 Referral program</h2>
        <p className="text-sm text-slate-500">Share your link — your username is your affiliate ID.</p>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <code className="flex-1 truncate text-xs text-slate-600 dark:text-slate-300">{referralLink}</code>
          <Button size="sm" variant="soft" onClick={() => { navigator.clipboard.writeText(referralLink); toast("Copied!", "success"); }}>
            Copy
          </Button>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1" size="lg" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="danger" size="lg" onClick={() => { signOut(); navigate("/"); }}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {children}
    </div>
  );
}
