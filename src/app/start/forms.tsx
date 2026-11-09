"use client";

import { useActionState } from "react";
import { saveDobAction, sendMagicLinkAction } from "@/app/start/actions";

export function EmailForm() {
  const [state, action, pending] = useActionState(sendMagicLinkAction, undefined);
  if (state?.sent) {
    return (
      <div className="text-center">
        <div className="text-5xl">📬</div>
        <h2 className="mt-3 text-2xl font-black">Check your email</h2>
        <p className="mt-2 font-semibold text-muted">
          We sent a magic link to <b className="text-ink">{state.sent}</b>. Tap it to keep going.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <input name="email" type="email" className="input" placeholder="your email" autoComplete="email" required />
      <label className="flex items-start gap-3 text-left text-sm font-bold text-muted">
        <input name="adult" type="checkbox" className="mt-0.5 size-5 accent-pink-500" required />
        <span>
          I&apos;m 18 or older and agree to the{" "}
          <a href="/terms" className="text-hot underline">
            terms
          </a>
          .
        </span>
      </label>
      <button className="btn-hot" disabled={pending}>
        {pending ? "sending…" : "Send my magic link ✨"}
      </button>
      {state?.error ? <p className="text-center text-sm font-bold text-hot">{state.error}</p> : null}
    </form>
  );
}

export function DobForm() {
  const [state, action, pending] = useActionState(saveDobAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="text-left text-sm font-extrabold text-muted" htmlFor="dob">
        Your birthday 🎂
      </label>
      <input id="dob" name="dob" type="date" className="input" required />
      <button className="btn-hot" disabled={pending}>
        {pending ? "saving…" : "Continue"}
      </button>
      <p className="text-center text-xs font-semibold text-muted">Only used to confirm you&apos;re 18+. Never shown to anyone.</p>
      {state?.error ? <p className="text-center text-sm font-bold text-hot">{state.error}</p> : null}
    </form>
  );
}
