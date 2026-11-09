import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/supabase";
import { adminCreateTesterAccountAction, adminRemoveOptOutAction, adminResolveReportAction, adminVerifyAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Console" };

export default async function AdminPage() {
  const viewer = await requireAdmin();

  // Load stats
  const [
    { count: totalUsers },
    { count: totalVerified },
    { count: activeCrushes },
    { count: totalMatches },
  ] = await Promise.all([
    db().from("profiles").select("*", { count: "exact", head: true }),
    db().from("profiles").select("*", { count: "exact", head: true }).not("verified_at", "is", null),
    db().from("crushes").select("*", { count: "exact", head: true }).is("removed_at", null).is("matched_at", null),
    db().from("matches").select("*", { count: "exact", head: true }),
  ]);

  // Load recent verified profiles and their passcodes (for testing login)
  const { data: verifiedUsers } = await db()
    .from("profiles")
    .select("id,ig_username,passcode,email,created_at")
    .not("ig_username", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  // Load open reports
  const { data: reports } = await db()
    .from("reports")
    .select("id,reporter_id,reported_id,reason,status,created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);

  // Load opt-outs
  const { data: optOuts } = await db()
    .from("opt_outs")
    .select("ig_username,source,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="min-h-dvh bg-zinc-950 px-4 py-10 font-sans text-zinc-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-pink-500">No Names Admin Console</h1>
            <p className="text-xs text-zinc-400">Logged in as {viewer.email}</p>
          </div>
          <a href="/crushes" className="text-xs font-bold text-zinc-400 hover:text-white">
            ← App
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-bold uppercase text-zinc-500">Total Users</div>
            <div className="mt-1 text-2xl font-black">{totalUsers ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-bold uppercase text-zinc-500">Verified</div>
            <div className="mt-1 text-2xl font-black text-pink-400">{totalVerified ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-bold uppercase text-zinc-500">Active Crushes</div>
            <div className="mt-1 text-2xl font-black text-purple-400">{activeCrushes ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-bold uppercase text-zinc-500">Total Matches</div>
            <div className="mt-1 text-2xl font-black text-green-400">{totalMatches ?? 0}</div>
          </div>
        </div>

        {/* Create Tester Account in 1-Click */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Create Beta / Tester Account</h2>
            <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-bold text-pink-400">
              Instant Bypass
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Create an account directly with an Instagram handle and passcode to test immediately!
          </p>

          <form action={adminCreateTesterAccountAction} className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              name="username"
              placeholder="IG username (e.g. jordan.k)"
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-pink-500 outline-none flex-1"
              required
            />
            <input
              name="passcode"
              placeholder="Custom Passcode (e.g. 12345)"
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-pink-500 outline-none w-44"
            />
            <button className="rounded-xl bg-pink-600 px-5 py-2 text-sm font-bold text-white hover:bg-pink-500 transition">
              Create Tester
            </button>
          </form>
        </div>

        {/* Verified User Passcode Roster */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-lg font-bold text-white">Active Accounts & Secret Codes ({verifiedUsers?.length ?? 0})</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Use these handles + passcodes to log in right from the home page.
          </p>

          <div className="mt-4 divide-y divide-zinc-800">
            {verifiedUsers && verifiedUsers.length > 0 ? (
              verifiedUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-sm font-black text-pink-400">@{u.ig_username}</span>
                    <span className="text-xs text-zinc-500 ml-2">({u.email || "IG DM Login"})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Code:</span>
                    <span className="rounded-md bg-zinc-800 px-2 py-1 font-mono text-xs font-bold text-yellow-400">
                      {u.passcode || "No code"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-xs text-zinc-500">No verified accounts yet.</p>
            )}
          </div>
        </div>

        {/* Reports Queue */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-lg font-bold text-white">User Reports Queue ({reports?.length ?? 0})</h2>
          <div className="mt-4 divide-y divide-zinc-800">
            {reports && reports.length > 0 ? (
              reports.map((r) => (
                <div key={r.id} className="flex items-start justify-between py-3">
                  <div>
                    <div className="text-xs font-bold text-red-400">Reason: {r.reason}</div>
                    <div className="text-[10px] text-zinc-500">
                      Reported ID: {r.reported_id} · By: {r.reporter_id}
                    </div>
                  </div>
                  <form action={adminResolveReportAction}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <button className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-700">
                      Mark Resolved
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="py-4 text-xs text-zinc-500">Zero active reports. All clear! 🛡️</p>
            )}
          </div>
        </div>

        {/* Opt-Out Registry */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-lg font-bold text-white">Opt-Out Registry ({optOuts?.length ?? 0})</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {optOuts && optOuts.length > 0 ? (
              optOuts.map((o) => (
                <div
                  key={o.ig_username}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300"
                >
                  <span>@{o.ig_username}</span>
                  <span className="text-[10px] text-zinc-500">({o.source})</span>
                  <form action={adminRemoveOptOutAction} className="inline">
                    <input type="hidden" name="username" value={o.ig_username} />
                    <button className="text-zinc-500 hover:text-red-400 font-bold ml-1">✕</button>
                  </form>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No opted out usernames.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
