/** Instagram usernames: 1–30 chars, letters, numbers, periods, underscores. */
const IG_USERNAME = /^[a-z0-9._]{1,30}$/;

/** Normalize user input like " @Jordan.K " or "instagram.com/jordan.k/" to "jordan.k". */
export function normalizeUsername(input: string): string {
  let s = (input ?? "").trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/^(www\.)?instagram\.com\//, "");
  s = s.split(/[/?#]/)[0] ?? "";
  s = s.replace(/^@+/, "");
  return s;
}

export function isValidUsername(username: string): boolean {
  if (!IG_USERNAME.test(username)) return false;
  // Instagram doesn't allow leading/trailing periods or consecutive periods.
  if (username.startsWith(".") || username.endsWith(".")) return false;
  if (username.includes("..")) return false;
  return true;
}

/** Returns the normalized username or null if invalid. */
export function parseUsername(input: string): string | null {
  const u = normalizeUsername(input);
  return isValidUsername(u) ? u : null;
}
