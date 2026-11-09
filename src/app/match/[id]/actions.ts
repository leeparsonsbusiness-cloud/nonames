"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/session";
import { blockUser, reportUser } from "@/lib/data";

export async function blockMatchAction(formData: FormData) {
  const viewer = await requireViewer();
  const matchId = String(formData.get("matchId"));
  const blockedId = String(formData.get("blockedId"));
  if (!matchId || !blockedId) return;

  await blockUser(viewer.userId, blockedId, matchId);
  revalidatePath("/crushes");
  redirect("/crushes");
}

export async function reportMatchAction(_: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const viewer = await requireViewer();
  const matchId = String(formData.get("matchId"));
  const reportedId = String(formData.get("reportedId"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "Please provide a reason for the report." };

  await reportUser(viewer.userId, reportedId, reason, matchId);
  return { ok: true };
}
