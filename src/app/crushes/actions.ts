"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/session";
import { addCrush, removeCrush, renewCrush, type AddCrushError } from "@/lib/data";
import { parseUsername } from "@/lib/username";

const messages: Record<AddCrushError, string> = {
  not_verified: "Verify your Instagram first.",
  invalid_username: "That doesn't look like an Instagram username 🤔",
  self: "Self-love is valid, but you can't crush on yourself 😅",
  opted_out: "That account opted out of No Names.",
  unavailable: "You can't add that account.",
  duplicate: "They're already on your list 💌",
  no_slots: "All your slots are full. Remove one or wait for one to expire.",
};

export async function addCrushAction(_: { error?: string; ok?: string } | undefined, formData: FormData) {
  const viewer = await requireViewer();
  const username = parseUsername(String(formData.get("username") ?? ""));
  if (!username) return { error: messages.invalid_username };

  const res = await addCrush(viewer.userId, username);
  if (!res.ok) return { error: messages[res.error ?? "invalid_username"] };
  if (res.match_id) redirect(`/match/${res.match_id}`);
  revalidatePath("/crushes");
  return { ok: `@${username} added. Fingers crossed 🤞` };
}

export async function removeCrushAction(formData: FormData) {
  const viewer = await requireViewer();
  await removeCrush(viewer.userId, String(formData.get("id")));
  revalidatePath("/crushes");
}

export async function renewCrushAction(formData: FormData) {
  const viewer = await requireViewer();
  await renewCrush(viewer.userId, String(formData.get("id")));
  revalidatePath("/crushes");
}
