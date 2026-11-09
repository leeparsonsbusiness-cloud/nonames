import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAuthClient } from "@/lib/supabase";

/** Magic-link landing: supports both PKCE (?code=) and token-hash (?token_hash=&type=) links. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/start";
  const supabase = await createAuthClient();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  return NextResponse.redirect(new URL(ok ? safeNext : "/start?error=link", url.origin));
}
