import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouter } from "../lib/router";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { MoonIcon, SunIcon, BellIcon } from "./Icons";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-500/30">
        B
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Brix<span className="text-indigo-500">node</span>
      </span>
    </Link>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const cls = `h-6 w-6 ${active ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"}`;
  const icons: Record<string, ReactNode> = {
    home: (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h14V10" /></svg>
    ),
    explore: (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4-4" /></svg>
    ),
    library: (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4zM9 5v14" /></svg>
    ),
    sell: (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10l2-6h14l2 6M5 10v10h14V10M9 14h6" /></svg>
    ),
    account: (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
    ),
  };
  return <>{icons[name]}</>;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { path, navigate } = useRouter();
  const { user, profile, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => setNotifCount(count || 0));
  }, [user, path]);

  const isActive = (p: string) =>
    p === "/" ? path === "/" : path.startsWith(p);

  const navLinks = [
    { to: "/", label: "Home", icon: "home" },
    { to: "/explore", label: "Explore", icon: "explore" },
    { to: "/library", label: "Library", icon: "library" },
    { to: "/sell", label: "Sell", icon: "sell" },
  ];

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive(l.to)
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive("/admin")
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {dark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
            {user && (
              <Link
                to="/notifications"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <BellIcon className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {notifCount}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                    {(profile?.full_name || profile?.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-semibold text-slate-700 sm:block dark:text-slate-200">
                    {profile?.username || "Account"}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {[
                      { to: "/library", label: "📚 My Library" },
                      { to: "/sell", label: "🛍️ Creator Studio" },
                      { to: "/orders", label: "🧾 My Orders" },
                      { to: "/profile", label: "⚙️ Profile & Payouts" },
                      ...(profile?.username
                        ? [{ to: `/@${profile.username}`, label: "🏪 My Storefront" }]
                        : []),
                      ...(profile?.role === "admin"
                        ? [{ to: "/admin", label: "🛡️ Admin Dashboard" }]
                        : []),
                    ].map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {i.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        signOut();
                        navigate("/");
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      ↪ Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="mt-12 hidden border-t border-slate-200 bg-white py-10 md:block dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              The elevated hub for digital tools, AI assets, templates,
              knowledge & creation.
            </p>
          </div>
          <FooterCol title="Marketplace" links={[["Explore", "/explore"], ["Sell on Brixnode", "/sell"], ["My Library", "/library"]]} />
          <FooterCol title="Company" links={[["About", "/page/about"], ["Creator Agreement", "/page/creators"], ["Contact", "/page/contact"]]} />
          <FooterCol title="Legal" links={[["Terms of Service", "/page/terms"], ["Privacy Policy", "/page/privacy"], ["DMCA & Refunds", "/page/dmca"]]} />
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Brixnode. Secure manual-payment digital
          marketplace.
        </p>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/95">
        {navLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex flex-col items-center gap-0.5 py-2.5"
          >
            <NavIcon name={l.icon} active={isActive(l.to)} />
            <span
              className={`text-[10px] font-semibold ${
                isActive(l.to)
                  ? "text-indigo-500"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {l.label}
            </span>
          </Link>
        ))}
        <Link
          to={user ? "/profile" : "/auth"}
          className="flex flex-col items-center gap-0.5 py-2.5"
        >
          <NavIcon name="account" active={isActive("/profile") || isActive("/auth")} />
          <span
            className={`text-[10px] font-semibold ${
              isActive("/profile")
                ? "text-indigo-500"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            Account
          </span>
        </Link>
      </nav>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
