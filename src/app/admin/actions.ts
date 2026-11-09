"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { bindUsername, undoOptOut, getOrCreatePasscodeForInstagram } from "@/lib/data";
import { parseUsername } from "@/lib/username";
import { cleanPasscode, generatePasscode } from "@/lib/codes";
import { db } from "@/lib/supabase";

export async function adminCreateTesterAccountAction(formData: FormData) {
  await requireAdmin();
  const rawUsername = String(formData.get("username") ?? "");
  const username = parseUsername(rawUsername);
  if (!username) return;

  const rawPasscode = String(formData.get("passcode") ?? "");
  const passcode = cleanPasscode(rawPasscode) || generatePasscode();

  const { profile } = await getOrCreatePasscodeForInstagram(username, null);
  await db().from("profiles").update({ passcode, verified_at: new Date().toISOString() }).eq("id", profile.id);

  revalidatePath("/admin");
}

export async function adminVerifyAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const rawUsername = String(formData.get("username") ?? "");
  const username = parseUsername(rawUsername);
  if (!userId || !username) return;

  await bindUsername(userId, username, null);
  revalidatePath("/admin");
}

export async function adminResolveReportAction(formData: FormData) {
  await requireAdmin();
  const reportId = String(formData.get("reportId") ?? "");
  if (!reportId) return;

  await db().from("reports").update({ status: "resolved" }).eq("id", reportId);
  revalidatePath("/admin");
}

export async function adminRemoveOptOutAction(formData: FormData) {
  await requireAdmin();
  const username = String(formData.get("username") ?? "");
  if (!username) return;

  await undoOptOut(username);
  revalidatePath("/admin");
}
