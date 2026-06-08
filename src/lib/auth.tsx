import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { Profile } from "./types";

// Designate an admin by email. Change this to your own admin email.
const ADMIN_EMAILS = ["admin@brixnode.com"];

interface AuthCtx {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<{ error?: string }>;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthCtx["user"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string, email: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    if (data) {
      let p = data as Profile;
      if (ADMIN_EMAILS.includes(email) && p.role !== "admin") {
        await supabase.from("profiles").update({ role: "admin" }).eq("id", uid);
        p = { ...p, role: "admin" };
      }
      setProfile(p);
    } else {
      // create a fallback profile row
      const username = email.split("@")[0];
      const role = ADMIN_EMAILS.includes(email) ? "admin" : "buyer";
      const newP = {
        id: uid,
        email,
        full_name: "",
        username,
        bio: "",
        avatar_url: "",
        banner_url: "",
        role,
        is_creator: false,
        payout_method: "",
        payout_details: "",
        referral_name: "",
        links: "",
      };
      await supabase.from("profiles").upsert(newP);
      setProfile(newP as Profile);
    }
  }, []);

  const init = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    if (s?.user) {
      setUser({ id: s.user.id, email: s.user.email || "" });
      await loadProfile(s.user.id, s.user.email || "");
    }
    setLoading(false);
  }, [loadProfile]);

  useEffect(() => {
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
        loadProfile(session.user.id, session.user.email || "");
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [init, loadProfile]);

  const signUp = useCallback<AuthCtx["signUp"]>(
    async (email, password, fullName, username) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, username } },
      });
      if (error) return { error: error.message };
      return {};
    },
    []
  );

  const signIn = useCallback<AuthCtx["signIn"]>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id, user.email);
  }, [user, loadProfile]);

  const updateProfile = useCallback<AuthCtx["updateProfile"]>(
    async (patch) => {
      if (!user) return { error: "Not signed in" };
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id);
      if (error) return { error: error.message };
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
      return {};
    },
    [user]
  );

  return (
    <Ctx.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
