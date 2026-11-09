"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addCrushAction } from "@/app/crushes/actions";

export function AddCrush({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addCrushAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center rounded-3xl border-2 border-dashed border-zinc-300 py-7 text-lg font-extrabold text-zinc-400 transition hover:border-hot hover:text-hot disabled:opacity-50"
        >
          + add a crush
        </button>
        {state?.ok ? <p className="mt-2 text-center text-sm font-bold text-grape">{state.ok}</p> : null}
      </>
    );
  }

  return (
    <form ref={formRef} action={action} className="card flex flex-col gap-3 p-4">
      <label className="relative block">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-400">@</span>
        <input
          name="username"
          autoFocus
          className="input pl-11"
          placeholder="their instagram username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          required
        />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn flex-1 bg-zinc-100 text-base text-muted">
          cancel
        </button>
        <button className="btn-hot flex-[2] text-base" disabled={pending}>
          {pending ? "adding…" : "Add secretly 🤫"}
        </button>
      </div>
      {state?.error ? <p className="text-center text-sm font-bold text-hot">{state.error}</p> : null}
      <p className="text-center text-xs font-semibold text-muted">They&apos;ll never know it was you, unless they add you too.</p>
    </form>
  );
}
