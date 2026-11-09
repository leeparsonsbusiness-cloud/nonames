"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/session";
import { createAuthClient, db } from "@/lib/supabase";
import { optOut } from "@/lib/data";

export async function updatePreferencesAction(formData: FormData) {
  const viewer = await requireViewer();
  const showCountPublic = formData.get("show_count_public") === "on";
  const allowRevealingHints = formData.get("allow_revealing_hints") === "on";

  await db()
    .from("profiles")
    .update({
      show_count_public: showCountPublic,
      allow_revealing_hints: allowRevealingHints,
    })
    .eq("id", viewer.userId);

  revalidatePath("/settings");
  revalidatePath("/crushes");
}

export async function optOutSelfAction() {
  const viewer = await requireViewer();
  if (viewer.profile.ig_username) {
    await optOut(viewer.profile.ig_username, "web");
  }
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/?opted_out=1");
}

export async function deleteAccountAction() {
  const viewer = await requireViewer();
  await db().auth.admin.deleteUser(viewer.userId);
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
