"use client";

import { useState, useActionState } from "react";
import { blockMatchAction, reportMatchAction } from "./actions";

export function MatchSafety({
  matchId,
  otherId,
  otherUsername,
}: {
  matchId: string;
  otherId: string;
  otherUsername: string;
}) {
  const [open, setOpen] = useState(false);
  const [reportState, reportAction, reportPending] = useActionState(reportMatchAction, undefined);

  return (
    <div className="mt-8 text-center">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-bold text-white/60 hover:text-white underline transition"
      >
        Safety tools (block / report @{otherUsername})
      </button>

      {open ? (
        <div className="card mt-4 p-5 text-left text-ink shadow-2xl">
          <h3 className="text-base font-black text-ink">Safety & Privacy</h3>
          <p className="mt-1 text-xs font-semibold text-muted">
            If you feel uncomfortable, you can instantly unmatch & block, or submit a report to moderators.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <form action={blockMatchAction}>
              <input type="hidden" name="matchId" value={matchId} />
              <input type="hidden" name="blockedId" value={otherId} />
              <button
                type="submit"
                className="w-full rounded-2xl bg-zinc-100 py-3 text-xs font-extrabold text-zinc-700 hover:bg-zinc-200 transition"
              >
                Block & Unmatch quietly
              </button>
            </form>

            <div className="border-t border-zinc-100 pt-3">
              <span className="text-xs font-black text-muted">Report this user:</span>
              {reportState?.ok ? (
                <p className="mt-2 text-xs font-bold text-green-600">Report submitted. Thank you for keeping No Names safe.</p>
              ) : (
                <form action={reportAction} className="mt-2 flex flex-col gap-2">
                  <input type="hidden" name="matchId" value={matchId} />
                  <input type="hidden" name="reportedId" value={otherId} />
                  <input
                    name="reason"
                    placeholder="Why are you reporting? (harassment, under 18, etc.)"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-hot"
                    required
                  />
                  <button
                    disabled={reportPending}
                    className="w-full rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white disabled:opacity-50 hover:bg-red-600 transition"
                  >
                    {reportPending ? "submitting…" : "Submit Report"}
                  </button>
                  {reportState?.error ? <p className="text-xs font-bold text-red-500">{reportState.error}</p> : null}
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ShareButton({ otherUsername }: { otherUsername: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `Someone and I just matched on No Names 💘 Check if you have crushes too: https://nonames.love`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "It's Mutual! 💘", text, url: "https://nonames.love" });
        return;
      } catch {}
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="mt-3 text-base font-extrabold text-white/90 hover:text-white transition drop-shadow-sm"
    >
      {copied ? "Copied share text! ✨" : "Share the moment ✨"}
    </button>
  );
}
