"use server";

import { redirect } from "next/navigation";
import { createAuthClient, db } from "@/lib/supabase";
import { getViewer } from "@/lib/session";
import { isAdult } from "@/lib/dates";
import { env } from "@/lib/env";

type State = { error?: string; sent?: string } | undefined;

export async function sendMagicLinkAction(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a real email 🙏" };
  if (formData.get("adult") !== "on") return { error: "No Names is 18+ only." };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${env.siteUrl}/auth/callback?next=/start` },
  });
  if (error) return { error: "Couldn't send the link. Try again in a minute." };
  return { sent: email };
}

export async function saveDobAction(_: State, formData: FormData): Promise<State> {
  const viewer = await getViewer();
  if (!viewer) redirect("/start");
  const dob = String(formData.get("dob") ?? "");
  if (!isAdult(dob)) {
    // Under 18 (or invalid): don't keep the account.
    await db().auth.admin.deleteUser(viewer.userId);
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
    return { error: "Sorry, No Names is only for people 18 and older." };
  }
  await db().from("profiles").update({ dob }).eq("id", viewer.userId);
  redirect("/verify");
}

export async function signOutAction() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/");
}
