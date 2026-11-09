"use server";

import { redirect } from "next/navigation";
import { cleanPasscode } from "@/lib/codes";
import { authenticateByPasscodeOnly } from "@/lib/data";
import { setSessionUser } from "@/lib/session";
import { env } from "@/lib/env";

type State = { error?: string } | undefined;

export async function loginWithPasscodeAction(_: State, formData: FormData): Promise<State> {
  const rawCode = String(formData.get("passcode") ?? "");
  const isAdultCheck = formData.get("adult") === "on";

  const passcode = cleanPasscode(rawCode);
  if (!passcode) {
    return { error: "Please enter your secret access code." };
  }

  if (!isAdultCheck) {
    return { error: "No Names is strictly for ages 18 and older." };
  }

  const profile = await authenticateByPasscodeOnly(passcode);
  if (!profile) {
    return {
      error: `Code not found! Tap Step 1 above to DM @${env.botHandle} and get your code instantly.`,
    };
  }

  await setSessionUser(profile.id);
  redirect("/crushes");
}
