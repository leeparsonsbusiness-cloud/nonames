import { redirect } from "next/navigation";
import { Footer, LoveShell } from "@/components/ui";
import { requireViewer } from "@/lib/session";
import { db } from "@/lib/supabase";
import { env } from "@/lib/env";
import { generateVerificationCode } from "@/lib/codes";
import { igDmLink } from "@/lib/instagram";
import { VerifyPanel } from "./VerifyPanel";

export const metadata = { title: "verify your instagram" };

const CODE_TTL_MIN = 15;

async function getOrCreateCode(userId: string): Promise<{ code: string; expiresAt: string }> {
  const { data: existing } = await db()
    .from("verification_codes")
    .select("code,expires_at")
    .eq("user_id", userId)
    .is("used_at", null)
    .gt("expires_at", new Date(Date.now() + 2 * 60_000).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) return { code: existing.code, expiresAt: existing.expires_at };

  const expiresAt = new Date(Date.now() + CODE_TTL_MIN * 60_000).toISOString();
  for (let i = 0; i < 5; i++) {
    const code = generateVerificationCode();
    const { error } = await db().from("verification_codes").insert({ code, user_id: userId, expires_at: expiresAt });
    if (!error) return { code, expiresAt };
  }
  throw new Error("Could not generate a verification code");
}

export default async function VerifyPage() {
  const viewer = await requireViewer("adult");
  if (viewer.isVerified) redirect("/crushes");
  const { code, expiresAt } = await getOrCreateCode(viewer.userId);

  return (
    <LoveShell>
      <h1 className="text-center text-4xl font-black">Prove it&apos;s you 🔐</h1>
      <p className="mt-2 text-center font-bold text-white/90">
        DM this code to <b>@{env.botHandle}</b> from the Instagram account you want to use.
      </p>
      <div className="card mt-8 w-full p-6 text-ink">
        <VerifyPanel code={code} expiresAt={expiresAt} dmUrl={igDmLink(env.botHandle)} botHandle={env.botHandle} />
      </div>
      <p className="mt-6 text-center text-sm font-semibold text-white/80">
        We only see your username. We never post, follow, or message anyone for you.
      </p>
      <Footer light />
    </LoveShell>
  );
}
