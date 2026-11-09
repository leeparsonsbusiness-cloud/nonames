import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Session-aware client (anon key + auth cookies). Use ONLY for auth:
 * reading the current user, sending magic links, signing out.
 * All tables are locked by RLS, so this client can't read app data anyway.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. proxy.ts refreshes sessions.
        }
      },
    },
  });
}

let _admin: SupabaseClient | null = null;

/** Service-role client. Bypasses RLS. Server-only, never import from a client component. */
export function db(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}
