import { useEffect } from "react";
import { RouterProvider, useRouter, matchRoute } from "./lib/router";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { ToastProvider } from "./lib/toast";
import Layout from "./components/Layout";
import AIChat from "./components/AIChat";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import Library from "./pages/Library";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Sell from "./pages/Sell";
import Admin from "./pages/Admin";
import Storefront from "./pages/Storefront";
import Notifications from "./pages/Notifications";
import StaticPage from "./pages/StaticPage";

function Routes() {
  const { path } = useRouter();

  useEffect(() => {
    // capture referral for affiliate (username = affiliate id)
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem("bx_ref", ref);
  }, []);

  let page: React.ReactNode = <NotFound />;

  if (path === "/" || path === "") page = <Home />;
  else if (path === "/explore") page = <Explore />;
  else if (path === "/auth") page = <Auth />;
  else if (path === "/library") page = <Library />;
  else if (path === "/orders") page = <Orders />;
  else if (path === "/profile") page = <Profile />;
  else if (path === "/sell") page = <Sell />;
  else if (path === "/admin") page = <Admin />;
  else if (path === "/notifications") page = <Notifications />;
  else {
    const prod = matchRoute("/product/:id", path);
    const store = matchRoute("/:slug", path);
    const pageM = matchRoute("/page/:slug", path);
    if (prod) page = <ProductDetail id={prod.id} />;
    else if (pageM) page = <StaticPage slug={pageM.slug} />;
    else if (store && store.slug.startsWith("@"))
      page = <Storefront username={store.slug.slice(1)} />;
  }

  return (
    <Layout>
      {page}
      <AIChat />
    </Layout>
  );
}

function NotFound() {
  const { navigate } = useRouter();
  return (
    <div className="py-24 text-center">
      <p className="text-6xl">🔍</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
        Page not found
      </h1>
      <button
        onClick={() => navigate("/")}
        className="mt-4 rounded-xl bg-indigo-500 px-5 py-2.5 font-semibold text-white"
      >
        ← Back home
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </RouterProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
