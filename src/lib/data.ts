import "server-only";
import { db } from "@/lib/supabase";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { generatePasscode } from "@/lib/codes";
import type { Profile } from "@/lib/session";

export type Crush = {
  id: string;
  to_username: string;
  created_at: string;
  expires_at: string;
  matched_at: string | null;
};

export type MatchView = {
  id: string;
  created_at: string;
  other_username: string;
  seen: boolean;
};

export type AddCrushError =
  | "not_verified"
  | "invalid_username"
  | "self"
  | "opted_out"
  | "unavailable"
  | "duplicate"
  | "no_slots";

// ---------------------------------------------------------------------------
// Crushes
// ---------------------------------------------------------------------------

export async function listActiveCrushes(userId: string): Promise<Crush[]> {
  const { data, error } = await db()
    .from("crushes")
    .select("id,to_username,created_at,expires_at,matched_at")
    .eq("from_user_id", userId)
    .is("removed_at", null)
    .is("matched_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function slotLimit(userId: string): Promise<number> {
  const { data } = await db().from("entitlements").select("extra_slots").eq("user_id", userId).maybeSingle();
  return env.baseSlots + (data?.extra_slots ?? 0);
}

export async function addCrush(userId: string, username: string) {
  const { data, error } = await db().rpc("add_crush", {
    p_user: userId,
    p_username: username,
    p_base_slots: env.baseSlots,
  });
  if (error) throw error;
  const result = data as { ok: boolean; error?: AddCrushError; crush_id?: string; match_id?: string | null };
  if (result.ok && result.match_id) await notifyMatch(result.match_id);
  return result;
}

export async function removeCrush(userId: string, crushId: string) {
  const { error } = await db()
    .from("crushes")
    .update({ removed_at: new Date().toISOString() })
    .eq("id", crushId)
    .eq("from_user_id", userId)
    .is("removed_at", null);
  if (error) throw error;
}

export async function renewCrush(userId: string, crushId: string) {
  const expires = new Date(Date.now() + env.crushDays * 86_400_000).toISOString();
  const { error } = await db()
    .from("crushes")
    .update({ expires_at: expires, reminder_sent_at: null })
    .eq("id", crushId)
    .eq("from_user_id", userId)
    .is("removed_at", null)
    .is("matched_at", null);
  if (error) throw error;
}

/** Unmatched, active crushes pointing at a username. Never exposes who. */
export async function incomingCount(username: string): Promise<number> {
  const { data, error } = await db().rpc("incoming_count", { p_username: username });
  if (error) throw error;
  return (data as number) ?? 0;
}

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------

export async function listMatches(userId: string): Promise<MatchView[]> {
  const { data, error } = await db()
    .from("matches")
    .select("id,created_at,user_a,user_b,seen_by_a,seen_by_b")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .is("hidden_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const otherIds = rows.map((m) => (m.user_a === userId ? m.user_b : m.user_a));
  if (otherIds.length === 0) return [];
  const { data: others } = await db().from("profiles").select("id,ig_username").in("id", otherIds);
  const names = new Map((others ?? []).map((p) => [p.id, p.ig_username as string]));
  return rows
    .map((m) => {
      const otherId = m.user_a === userId ? m.user_b : m.user_a;
      return {
        id: m.id,
        created_at: m.created_at,
        other_username: names.get(otherId) ?? "",
        seen: m.user_a === userId ? m.seen_by_a : m.seen_by_b,
      };
    })
    .filter((m) => m.other_username);
}

/** A match the user is part of (null otherwise). Marks it seen. */
export async function getMatchForUser(matchId: string, userId: string) {
  const { data: m } = await db().from("matches").select("*").eq("id", matchId).is("hidden_at", null).maybeSingle();
  if (!m || (m.user_a !== userId && m.user_b !== userId)) return null;
  const isA = m.user_a === userId;
  const otherId = isA ? m.user_b : m.user_a;
  const { data: other } = await db().from("profiles").select("id,ig_username").eq("id", otherId).maybeSingle();
  if (!other?.ig_username) return null;
  await db().from("matches").update(isA ? { seen_by_a: true } : { seen_by_b: true }).eq("id", matchId);
  return { id: m.id as string, otherId: other.id as string, otherUsername: other.ig_username as string };
}

async function notifyMatch(matchId: string) {
  const { data: m } = await db().from("matches").select("id,user_a,user_b").eq("id", matchId).maybeSingle();
  if (!m) return;
  const { data: people } = await db().from("profiles").select("id,email").in("id", [m.user_a, m.user_b]);
  await Promise.all(
    (people ?? [])
      .filter((p) => p.email)
      .map((p) =>
        sendEmail(p.email as string, "IT'S MUTUAL 💘", {
          title: "It's mutual 💘",
          text: "Someone you picked just picked you back. No more secrets.",
          cta: { label: "See who it is", url: `${env.siteUrl}/match/${m.id}` },
        }),
      ),
  );
}

// ---------------------------------------------------------------------------
// Safety
// ---------------------------------------------------------------------------

export async function blockUser(blockerId: string, blockedId: string, matchId?: string) {
  await db().from("blocks").upsert({ blocker_id: blockerId, blocked_id: blockedId });
  if (matchId) await db().from("matches").update({ hidden_at: new Date().toISOString() }).eq("id", matchId);
  const { data: ps } = await db().from("profiles").select("id,ig_username").in("id", [blockerId, blockedId]);
  const name = new Map((ps ?? []).map((p) => [p.id, p.ig_username as string | null]));
  const now = new Date().toISOString();
  const pairs: [string, string | null | undefined][] = [
    [blockerId, name.get(blockedId)],
    [blockedId, name.get(blockerId)],
  ];
  for (const [from, to] of pairs) {
    if (to) await db().from("crushes").update({ removed_at: now }).eq("from_user_id", from).eq("to_username", to).is("removed_at", null);
  }
}

export async function reportUser(reporterId: string, reportedId: string, reason: string, matchId?: string) {
  await db().from("reports").insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    reason: reason.slice(0, 1000),
    match_id: matchId ?? null,
  });
}

export async function isOptedOut(username: string): Promise<boolean> {
  const { data } = await db().from("opt_outs").select("ig_username").eq("ig_username", username).maybeSingle();
  return Boolean(data);
}

/** Opt a username out: it can never be added, and any live crushes on it are retired. */
export async function optOut(username: string, source: "web" | "dm" | "admin") {
  await db().from("opt_outs").upsert({ ig_username: username, source });
  await db().from("crushes").update({ removed_at: new Date().toISOString() }).eq("to_username", username).is("removed_at", null);
}

export async function undoOptOut(username: string) {
  await db().from("opt_outs").delete().eq("ig_username", username);
}

// ---------------------------------------------------------------------------
// Passcode & Instagram Identity
// ---------------------------------------------------------------------------

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data } = await db().from("profiles").select("*").eq("ig_username", username).maybeSingle<Profile>();
  return data;
}

/**
 * When someone DMs the bot on Instagram, this retrieves their permanent secret passcode
 * or creates an account and generates one for them.
 */
export async function getOrCreatePasscodeForInstagram(username: string, igUserId: string | null) {
  const existing = await getProfileByUsername(username);
  if (existing) {
    if (!existing.passcode) {
      const code = generatePasscode();
      await db().from("profiles").update({ passcode: code }).eq("id", existing.id);
      existing.passcode = code;
    }
    return { profile: existing, isNew: false };
  }

  // New profile
  const passcode = generatePasscode();
  const { data, error } = await db()
    .from("profiles")
    .insert({
      ig_username: username,
      ig_user_id: igUserId,
      passcode,
      verified_at: new Date().toISOString(),
    })
    .select("*")
    .single<Profile>();

  if (error) throw error;
  return { profile: data, isNew: true };
}

/** Authenticate using ONLY the Secret Passcode (maps directly to their verified IG profile). */
export async function authenticateByPasscodeOnly(passcode: string): Promise<Profile | null> {
  const code = passcode.trim().toUpperCase();
  if (!code) return null;
  const { data } = await db()
    .from("profiles")
    .select("*")
    .eq("passcode", code)
    .maybeSingle<Profile>();

  return data;
}

/** Authenticate using Instagram Handle + Permanent Secret Passcode. */
export async function authenticateWithPasscode(username: string, passcode: string): Promise<Profile | null> {
  const { data } = await db()
    .from("profiles")
    .select("*")
    .eq("ig_username", username.toLowerCase().trim())
    .eq("passcode", passcode.trim().toUpperCase())
    .maybeSingle<Profile>();

  return data;
}

/**
 * Bind a verified Instagram username to a profile.
 */
export async function bindUsername(userId: string, username: string, igUserId: string | null, passcode?: string) {
  const client = db();
  await client.from("profiles").update({ ig_username: null, ig_user_id: null, verified_at: null }).eq("ig_username", username).neq("id", userId);
  if (igUserId) {
    await client.from("profiles").update({ ig_user_id: null }).eq("ig_user_id", igUserId).neq("id", userId);
  }
  const updates: Record<string, any> = {
    ig_username: username,
    ig_user_id: igUserId,
    verified_at: new Date().toISOString(),
  };
  if (passcode) updates.passcode = passcode;
  const { error } = await client.from("profiles").update(updates).eq("id", userId);
  if (error) throw error;
}
