"use server";

import { redirect } from "next/navigation";
import { parseUsername } from "@/lib/username";
import { cleanPasscode } from "@/lib/codes";
import { authenticateWithPasscode } from "@/lib/data";
import { setSessionUser } from "@/lib/session";

type State = { error?: string } | undefined;

export async function loginWithPasscodeAction(_: State, formData: FormData): Promise<State> {
  const rawUser = String(formData.get("username") ?? "");
  const rawCode = String(formData.get("passcode") ?? "");
  const isAdultCheck = formData.get("adult") === "on";

  const username = parseUsername(rawUser);
  if (!username) {
    return { error: "Please enter a valid Instagram handle." };
  }

  const passcode = cleanPasscode(rawCode);
  if (!passcode) {
    return { error: "Please enter your secret login code." };
  }

  if (!isAdultCheck) {
    return { error: "No Names is strictly for ages 18 and older." };
  }

  const profile = await authenticateWithPasscode(username, passcode);
  if (!profile) {
    return {
      error:
        "Code doesn't match @ " +
        username +
        ". Tap Step 1 above to DM @nonames.love and receive your code!",
    };
  }

  await setSessionUser(profile.id);
  redirect("/crushes");
}
