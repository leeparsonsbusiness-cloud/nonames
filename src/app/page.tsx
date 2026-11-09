import Link from "next/link";
import { Footer, LoveShell } from "@/components/ui";
import { PasscodeLoginForm } from "@/components/PasscodeLoginForm";
import { getViewer } from "@/lib/session";
import { env } from "@/lib/env";

const steps = [
  { emoji: "💬", title: "DM for your code", text: "DM @nonames.love on Instagram. Our bot gives you a permanent secret passcode." },
  { emoji: "💌", title: "Add up to 5 crushes", text: "Secretly add people by their Instagram username. They will never know." },
  { emoji: "💘", title: "Mutual? Unmasked.", text: "If any of them secretly pick you too, you both get unmasked and slide into DMs!" },
];

export default async function Home() {
  const viewer = await getViewer();

  return (
    <LoveShell>
      <h1 className="text-center text-4xl font-black leading-tight drop-shadow-sm sm:text-5xl">
        Someone might have a crush on you 👀
      </h1>
      <p className="mt-3 text-center text-lg font-bold text-white/90">No names. Until it&apos;s mutual.</p>

      <div className="card mt-8 w-full p-6 text-ink shadow-2xl">
        {viewer?.isVerified ? (
          <div className="text-center py-4">
            <div className="text-5xl animate-bounce">👋</div>
            <h2 className="mt-3 text-2xl font-black text-ink">Welcome back, @{viewer.profile.ig_username}!</h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              You are logged in and ready to view admirers.
            </p>
            <Link href="/crushes" className="btn-hot mt-5 w-full text-lg font-black shadow-lg">
              Open My Crush List 💌
            </Link>
          </div>
        ) : (
          <>
            <PasscodeLoginForm botHandle={env.botHandle} />
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <span className="chip text-[11px] py-1.5">100% anonymous</span>
              <span className="chip text-[11px] py-1.5">Mutual-only reveal</span>
              <span className="chip text-[11px] py-1.5">18+ UCLA only</span>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm font-bold text-white/90">
        Add up to 5 crushes. They&apos;ll never know… unless they pick you too.
      </p>

      <section className="mt-12 w-full space-y-3">
        <h2 className="text-center text-2xl font-black tracking-wide">how it works</h2>
        {steps.map((s, i) => (
          <div key={s.title} className="flex items-start gap-4 rounded-3xl bg-white/15 p-5 backdrop-blur">
            <div className="text-3xl">{s.emoji}</div>
            <div>
              <div className="font-black text-base">
                {i + 1}. {s.title}
              </div>
              <div className="text-xs font-semibold text-white/85 leading-relaxed">{s.text}</div>
            </div>
          </div>
        ))}
      </section>

      <Footer light />
    </LoveShell>
  );
}
