import Link from "next/link";
import { Footer, LoveShell } from "@/components/ui";
import { env } from "@/lib/env";
import { igDmLink } from "@/lib/instagram";

export const metadata = { title: "opt out" };

export default function OptOutPage() {
  const dmUrl = igDmLink(env.botHandle);

  return (
    <LoveShell>
      <div className="card w-full p-8 text-center text-ink shadow-2xl">
        <div className="text-5xl animate-bounce">🙅</div>
        <h1 className="mt-4 text-3xl font-black">Opt Out of No Names</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          Don&apos;t want anyone to add you as a crush? You have 100% control.
        </p>

        <div className="mt-6 rounded-3xl bg-pink-50 p-6 text-left border border-pink-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔐</span>
            <span className="text-sm font-black uppercase tracking-wider text-hot">Verified Protection</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-700 leading-relaxed">
            To prevent anyone from falsely opting out someone else&apos;s username, opt-outs are verified directly through Instagram DM.
          </p>

          <div className="mt-5 space-y-2 text-xs font-bold text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-hot text-[11px] text-white">1</span>
              <span>Open a direct message with <b>@{env.botHandle}</b> on Instagram</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-hot text-[11px] text-white">2</span>
              <span>Send the message: <b className="text-hot">&ldquo;opt out&rdquo;</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-hot text-[11px] text-white">3</span>
              <span>Instant block: Your handle is immediately blacklisted forever</span>
            </div>
          </div>

          <a
            href={dmUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-hot mt-6 w-full text-base font-extrabold"
          >
            DM &ldquo;opt out&rdquo; to @{env.botHandle} 💬
          </a>
        </div>

        <p className="mt-4 text-xs font-semibold text-muted">
          Any pending or active crushes pointing to your handle are permanently deleted the moment your DM arrives.
        </p>

        <Link href="/" className="btn-ghost mt-6 text-sm text-grape">
          ← Back to home
        </Link>
      </div>

      <Footer light />
    </LoveShell>
  );
}
