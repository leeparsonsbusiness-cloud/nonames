import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { db } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Check cron secret header if configured
  const authHeader = request.headers.get("authorization");
  if (env.cronSecret && authHeader !== `Bearer ${env.cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Mark expired crushes as removed
  const { data: expired } = await db()
    .from("crushes")
    .update({ removed_at: nowIso })
    .is("removed_at", null)
    .is("matched_at", null)
    .lte("expires_at", nowIso)
    .select("id");

  // 2. Send 3-day reminder for expiring crushes that haven't received a reminder yet
  const threeDaysAhead = new Date(now.getTime() + 3 * 86_400_000).toISOString();
  const { data: expiringSoon } = await db()
    .from("crushes")
    .select("id,from_user_id,to_username,expires_at")
    .is("removed_at", null)
    .is("matched_at", null)
    .is("reminder_sent_at", null)
    .lte("expires_at", threeDaysAhead)
    .gt("expires_at", nowIso);

  let remindersSent = 0;
  if (expiringSoon && expiringSoon.length > 0) {
    const userIds = [...new Set(expiringSoon.map((c) => c.from_user_id))];
    const { data: profiles } = await db().from("profiles").select("id,email").in("id", userIds);
    const emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]));

    for (const crush of expiringSoon) {
      const email = emailMap.get(crush.from_user_id);
      if (email) {
        await sendEmail(email, "Your crush is expiring soon ⏳", {
          title: "Expiring in 3 days! ⏳",
          text: `Your crush on @${crush.to_username} will quietly expire in 3 days. If you still have feelings, head over to your list to renew it for another 30 days.`,
          cta: { label: "Review my crush list", url: `${env.siteUrl}/crushes` },
        });
        remindersSent++;
      }
      await db().from("crushes").update({ reminder_sent_at: nowIso }).eq("id", crush.id);
    }
  }

  return NextResponse.json({
    ok: true,
    expiredCount: expired?.length ?? 0,
    remindersSent,
  });
}
