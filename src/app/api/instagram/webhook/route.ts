import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { isOptOutMessage, verifyMetaSignature } from "@/lib/codes";
import { fetchIgUsername, sendIgReply } from "@/lib/instagram";
import { getOrCreatePasscodeForInstagram, optOut } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Meta webhook verification handshake. */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && env.metaVerifyToken && p.get("hub.verify_token") === env.metaVerifyToken) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

type MessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: { mid?: string; text?: string; is_echo?: boolean };
};
type WebhookBody = { object?: string; entry?: { id?: string; messaging?: MessagingEvent[] }[] };

/** Incoming Instagram DMs to @nonames.love. */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!verifyMetaSignature(raw, request.headers.get("x-hub-signature-256"), env.metaAppSecret)) {
    return new NextResponse("bad signature", { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }

  const events = (body.entry ?? []).flatMap((e) => e.messaging ?? []);
  for (const ev of events) {
    try {
      await handleMessage(ev);
    } catch (err) {
      console.error("[webhook] failed to handle message", err);
    }
  }
  return NextResponse.json({ ok: true });
}

async function handleMessage(ev: MessagingEvent) {
  const igsid = ev.sender?.id;
  const text = ev.message?.text;
  if (!igsid || !text || ev.message?.is_echo) return;

  if (isOptOutMessage(text)) {
    const username = await fetchIgUsername(igsid);
    if (!username) return sendIgReply(igsid, "Hmm, we couldn't read your username. Try again in a minute 🙏");
    await optOut(username, "dm");
    return sendIgReply(
      igsid,
      `Done. @${username} can never be added on No Names 🙅 All active crushes pointing to you have been removed.`,
    );
  }

  const username = await fetchIgUsername(igsid);
  if (!username) {
    return sendIgReply(igsid, "Hmm, we couldn't read your username right now. Try messaging again in a minute 🙏");
  }

  const { profile, isNew } = await getOrCreatePasscodeForInstagram(username, igsid);

  if (isNew) {
    return sendIgReply(
      igsid,
      `Hey @${username} 👋 Welcome to No Names! 💘\n\nYour permanent secret login code is:\n\n👉 ${profile.passcode} 👈\n\nKeep this code safe — it's your permanent key to log in at ${env.siteUrl} to see who has a crush on you and add yours!`,
    );
  } else {
    return sendIgReply(
      igsid,
      `Welcome back @${username}! 💘\n\nYour permanent secret login code is:\n\n👉 ${profile.passcode} 👈\n\nTap ${env.siteUrl} to log back in anytime and check your crushes!`,
    );
  }
}
