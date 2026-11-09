import "server-only";
import { env } from "@/lib/env";

/**
 * Meta "Instagram API with Instagram Login" helpers.
 * We only ever REPLY to people who messaged us first. Meta forbids cold DMs, and so do we.
 */
const GRAPH = () => `https://graph.instagram.com/${env.graphVersion}`;

/** Look up the username of a DM sender by their Instagram-scoped ID. */
export async function fetchIgUsername(igsid: string): Promise<string | null> {
  if (!env.igAccessToken) return null;
  const res = await fetch(`${GRAPH()}/${encodeURIComponent(igsid)}?fields=username`, {
    headers: { Authorization: `Bearer ${env.igAccessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[instagram] username lookup failed", res.status, await res.text().catch(() => ""));
    return null;
  }
  const json = (await res.json()) as { username?: string };
  return json.username ? json.username.toLowerCase() : null;
}

/** Reply to someone who DMed us (must be within Meta's 24h messaging window). */
export async function sendIgReply(igsid: string, text: string): Promise<void> {
  if (!env.igAccessToken) {
    console.log(`[instagram:dry-run] -> ${igsid}: ${text}`);
    return;
  }
  const res = await fetch(`${GRAPH()}/me/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.igAccessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id: igsid }, message: { text } }),
  });
  if (!res.ok) console.error("[instagram] send failed", res.status, await res.text().catch(() => ""));
}

/** Deep link that opens a DM thread with a user. */
export function igDmLink(username: string): string {
  return `https://ig.me/m/${encodeURIComponent(username)}`;
}
