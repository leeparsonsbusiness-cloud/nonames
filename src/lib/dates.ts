export const MIN_AGE = 18;

/** Age in whole years on `now` for an ISO date string (YYYY-MM-DD). Returns null if invalid. */
export function ageFromDob(dob: string, now: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const birth = new Date(Date.UTC(y, mo - 1, d));
  if (birth.getUTCFullYear() !== y || birth.getUTCMonth() !== mo - 1 || birth.getUTCDate() !== d) return null;
  if (birth > now) return null;
  let age = now.getUTCFullYear() - y;
  const beforeBirthday =
    now.getUTCMonth() < mo - 1 || (now.getUTCMonth() === mo - 1 && now.getUTCDate() < d);
  if (beforeBirthday) age -= 1;
  if (age > 120) return null;
  return age;
}

export function isAdult(dob: string, now: Date = new Date()): boolean {
  const age = ageFromDob(dob, now);
  return age !== null && age >= MIN_AGE;
}

/** Whole days until `date` (ceil), never negative. */
export function daysUntil(date: string | Date, now: Date = new Date()): number {
  const ms = new Date(date).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
