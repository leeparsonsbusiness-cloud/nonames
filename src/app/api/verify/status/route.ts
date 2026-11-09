import { NextResponse } from "next/server";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getViewer();
  return NextResponse.json({ verified: Boolean(viewer?.isVerified) }, { headers: { "Cache-Control": "no-store" } });
}
