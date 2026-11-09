"use client";

import { useActionState } from "react";
import { loginWithPasscodeAction } from "@/app/actions";

export function PasscodeLoginForm({ botHandle }: { botHandle: string }) {
  const [state, action, pending] = useActionState(loginWithPasscodeAction, undefined);
  const dmUrl = `https://ig.me/m/${encodeURIComponent(botHandle)}`;

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* Step 1: Open Instagram DM */}
      <div className="rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/70 p-4">
        <div className="text-xs font-black uppercase tracking-wider text-hot">Step 1: Get Your Code</div>
        <p className="mt-1 text-xs font-semibold text-zinc-600">
          DM anything (e.g. &ldquo;crush&rdquo;) to our official bot. It replies in 2 seconds with your permanent code!
        </p>
        <a
          href={dmUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-hot mt-3 flex w-full items-center justify-center gap-2 py-3.5 text-base font-extrabold shadow-md"
        >
          <span>Tap to DM @{botHandle}</span> 💬
        </a>
      </div>

      {/* Step 2: Enter Username + Code */}
      <form action={action} className="flex flex-col gap-3">
        <div className="text-xs font-black uppercase tracking-wider text-muted">Step 2: Enter & Unlock</div>

        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-zinc-400">@</span>
          <input
            name="username"
            className="input pl-10 text-base py-3"
            placeholder="your instagram username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="username"
            required
          />
        </label>

        <label className="relative block">
          <input
            name="passcode"
            type="text"
            className="input text-center text-lg tracking-widest font-black py-3"
            placeholder="5-digit code (e.g. 48219)"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={10}
            required
          />
        </label>

        <label className="flex items-center gap-2 text-xs font-bold text-muted px-1 mt-1">
          <input name="adult" type="checkbox" defaultChecked className="size-4 accent-pink-500 rounded" required />
          <span>I am 18 years of age or older (strict)</span>
        </label>

        <button className="btn-grape mt-2 w-full py-4 text-lg font-black shadow-lg" disabled={pending}>
          {pending ? "Unlocking…" : "Unlock My Crushes 💘"}
        </button>

        {state?.error ? (
          <div className="mt-2 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-600 border border-red-200">
            {state.error}
          </div>
        ) : null}
      </form>
    </div>
  );
}
