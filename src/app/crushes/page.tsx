import Link from "next/link";
import { AppNav, AppShell, Footer } from "@/components/ui";
import { requireViewer } from "@/lib/session";
import { incomingCount, listActiveCrushes, listMatches, slotLimit } from "@/lib/data";
import { daysUntil } from "@/lib/dates";
import { AddCrush } from "./AddCrush";
import { removeCrushAction, renewCrushAction } from "./actions";

export const metadata = { title: "your crush list" };

export default async function CrushesPage({ searchParams }: PageProps<"/crushes">) {
  const viewer = await requireViewer();
  const me = viewer.profile.ig_username!;
  const [crushes, limit, count, matches, sp] = await Promise.all([
    listActiveCrushes(viewer.userId),
    slotLimit(viewer.userId),
    incomingCount(me),
    listMatches(viewer.userId),
    searchParams,
  ]);
  const emptySlots = Math.max(0, limit - crushes.length);

  return (
    <AppShell right={<AppNav />}>
      {sp.welcome ? (
        <div className="card mb-4 p-4 text-center font-extrabold text-grape">You&apos;re verified as @{me} 🎉</div>
      ) : null}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">your crush list 💌</h1>
        <span className="rounded-full bg-grape px-3 py-1.5 text-sm font-black text-white">
          {crushes.length} / {limit} slots
        </span>
      </div>

      {/* Incoming */}
      <div className="bg-love mb-4 rounded-3xl p-6 text-center text-white shadow-lg">
        {count > 0 ? (
          <>
            <div className="text-2xl font-black leading-tight">
              🔥 {count} {count === 1 ? "person has" : "people have"} a crush on you
            </div>
            <p className="mt-1 text-sm font-bold text-white/85">Add them back. If you guess right, it&apos;s instantly mutual.</p>
            <button disabled className="btn mt-4 bg-sky-500 px-5 py-3 text-base text-white opacity-90">
              Get a hint 🔍 <span className="text-xs font-bold opacity-80">soon</span>
            </button>
          </>
        ) : (
          <>
            <div className="text-2xl font-black">No crushes on you… yet 🌱</div>
            <p className="mt-1 text-sm font-bold text-white/85">Share No Names and see who shows up 👀</p>
          </>
        )}
      </div>

      {/* Matches */}
      {matches.length > 0 ? (
        <section className="mb-4 space-y-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted">it&apos;s mutual 💘</h2>
          {matches.map((m) => (
            <Link key={m.id} href={`/match/${m.id}`} className="card flex items-center justify-between p-4">
              <span className="text-lg font-black text-ink">@{m.other_username}</span>
              <span className={`text-sm font-black ${m.seen ? "text-muted" : "text-hot"}`}>{m.seen ? "view" : "NEW ✨"}</span>
            </Link>
          ))}
        </section>
      ) : null}

      {/* Outgoing */}
      <section className="space-y-3">
        {crushes.map((c) => {
          const days = daysUntil(c.expires_at);
          return (
            <div key={c.id} className="card flex items-center gap-4 p-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-2xl">🤫</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-black text-ink">@{c.to_username}</div>
                <div className="flex items-center justify-between gap-2 text-sm font-bold">
                  <span className="text-amber-500">waiting… 🤞</span>
                  <span className="text-zinc-400">expires in {days}d</span>
                </div>
                {days <= 7 ? (
                  <form action={renewCrushAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="mt-1 text-xs font-black text-grape underline">renew 30 days</button>
                  </form>
                ) : null}
              </div>
              <form action={removeCrushAction}>
                <input type="hidden" name="id" value={c.id} />
                <button aria-label={`Remove @${c.to_username}`} className="flex size-8 items-center justify-center rounded-full bg-zinc-100 font-black text-zinc-400 hover:text-hot">
                  ✕
                </button>
              </form>
            </div>
          );
        })}

        {emptySlots > 0 ? <AddCrush disabled={false} /> : null}
        {Array.from({ length: Math.max(0, emptySlots - 1) }).map((_, i) => (
          <div key={i} className="rounded-3xl border-2 border-dashed border-zinc-200 py-7 text-center text-lg font-extrabold text-zinc-300">
            empty slot
          </div>
        ))}
      </section>

      <button disabled className="btn-grape mt-6 w-full">
        Unlock 5 more slots ✨ <span className="text-sm opacity-80">coming soon</span>
      </button>
      <p className="mt-3 text-center text-xs font-semibold text-muted">
        Removing a crush is silent. They&apos;ll never know. Crushes expire after 30 days.
      </p>
      <Footer />
    </AppShell>
  );
}
