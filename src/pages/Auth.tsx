import { useState } from "react";
import { useRouter, Link } from "../lib/router";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { Button, Input } from "../components/ui";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { error } = await signIn(email, password);
      if (error) toast(error, "error");
      else {
        toast("Welcome back! 👋", "success");
        navigate("/");
      }
    } else {
      if (!username.trim()) {
        toast("Pick a username", "error");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, username);
      if (error) toast(error, "error");
      else {
        toast("Account created! You can sign in now.", "success");
        setMode("in");
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center animate-fade">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-black text-white shadow-lg">
            B
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {mode === "in" ? "Welcome back" : "Join Brixnode"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "in"
              ? "Sign in to access your library"
              : "Create your account to buy & sell"}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          {mode === "up" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Full name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Username (your storefront & referral ID)
                </label>
                <Input
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="janedoe"
                />
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button className="w-full" size="lg" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "in"
              ? "Sign in"
              : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === "in" ? "New to Brixnode?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="font-semibold text-indigo-500 hover:underline"
          >
            {mode === "in" ? "Create account" : "Sign in"}
          </button>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          By continuing you agree to our{" "}
          <Link to="/page/terms" className="underline">
            Terms
          </Link>{" "}
          &{" "}
          <Link to="/page/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
