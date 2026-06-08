import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fycresqsgjqpfgvarxxq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5Y3Jlc3FzZ2pxcGZndmFyeHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTI4ODgsImV4cCI6MjA5NjQ4ODg4OH0.dgn7Rp8FjPBTkocSfvABOFB83J9mtJz_rrsCAtQc9_k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
