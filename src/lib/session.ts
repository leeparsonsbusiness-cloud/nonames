import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAuthClient, db } from "@/lib/supabase";
import { env } from "@/lib/env";

export type Profile = {
  id: string;
  email: string | null;
  passcode: string | null;
  dob: string | null;
  ig_username: string | null;
  ig_user_id: string | null;
  verified_at: string | null;
  show_count_public: boolean;
  allow_revealing_hints: boolean;
  created_at: string;
};

export type Viewer = {
  userId: string;
  email: string;
  profile: Profile;
  isAdmin: boolean;
  isVerified: boolean;
};

const SESSION_COOKIE = "nonames_session";
const SESSION_SECRET = () => env.metaAppSecret || "nonames_secret_session_key_2026";

function signSession(userId: string): string {
  const sig = createHmac("sha256", SESSION_SECRET()).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

function verifySessionToken(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const [userId, sig] = token.split(".");
  if (!userId || !sig) return null;
  const expected = createHmac("sha256", SESSION_SECRET()).update(userId).digest("hex");
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  return userId;
}

export async function setSessionUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 year persistent login
  });
}

export async function clearSessionUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** The logged-in user + profile, or null. Cached per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUserId = verifySessionToken(sessionToken);

  let profile: Profile | null = null;

  if (sessionUserId) {
    const { data } = await db().from("profiles").select("*").eq("id", sessionUserId).maybeSingle<Profile>();
    profile = data;
  }

  // Fallback to Supabase Auth if session cookie not present
  if (!profile) {
    try {
      const supabase = await createAuthClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const user = authData.user;
        const { data: p } = await db().from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
        profile = p;
        if (!profile) {
          const res = await db().from("profiles").upsert({ id: user.id, email: user.email }).select("*").single<Profile>();
          profile = res.data;
        }
      }
    } catch {}
  }

  if (!profile) return null;

  const email = (profile.email ?? "").toLowerCase();
  const igUser = (profile.ig_username ?? "").toLowerCase();
  const isAdmin =
    (Boolean(email) && env.adminEmails.includes(email)) ||
    (Boolean(igUser) && env.adminEmails.includes(igUser));

  return {
    userId: profile.id,
    email: profile.email ?? `${profile.ig_username}@nonames.internal`,
    profile,
    isAdmin,
    isVerified: Boolean(profile.verified_at && profile.ig_username),
  };
});

/**
 * Funnel guard: sends the user to the first onboarding step they haven't finished.
 */
export async function requireViewer(stage: "any" | "adult" | "verified" = "verified"): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/");
  if (stage === "any") return v;
  if (!v.isVerified) redirect("/");
  return v;
}

export async function requireAdmin(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/");
  if (!v.isAdmin) redirect("/");
  return v;
}
