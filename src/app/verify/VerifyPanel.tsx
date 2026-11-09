"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyPanel({ code, expiresAt, dmUrl, botHandle }: { code: string; expiresAt: string; dmUrl: string; botHandle: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);

  // Poll until the webhook marks us verified.
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch("/api/verify/status", { cache: "no-store" });
        const json = (await res.json()) as { verified?: boolean };
        if (json.verified && !stop) {
          router.replace("/crushes?welcome=1");
          return;
        }
      } catch {}
      if (Date.now() > new Date(expiresAt).getTime()) setExpired(true);
      if (!stop) setTimeout(tick, 3000);
    };
    const t = setTimeout(tick, 3000);
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [expiresAt, router]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (expired) {
    return (
      <div className="text-center">
        <p className="font-bold text-muted">That code expired.</p>
        <button className="btn-hot mt-4 w-full" onClick={() => router.refresh()}>
          Get a new code
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="text-xs font-black uppercase tracking-widest text-muted">your code</div>
      <button
        onClick={copy}
        className="rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50 py-5 font-mono text-4xl font-black tracking-widest text-hot"
        aria-label="Copy code"
      >
        {code}
      </button>
      <div className="text-sm font-bold text-muted">{copied ? "copied ✅" : "tap to copy"}</div>
      <a href={dmUrl} target="_blank" rel="noreferrer" className="btn-hot">
        Open DM with @{botHandle} 💬
      </a>
      <ol className="space-y-1 text-left text-sm font-semibold text-muted">
        <li>1. Copy the code</li>
        <li>2. Send it as a DM to @{botHandle}</li>
        <li>3. Come back here. This page updates by itself ✨</li>
      </ol>
      <div className="flex items-center justify-center gap-2 text-sm font-bold text-grape">
        <span className="inline-block size-2 animate-ping rounded-full bg-grape" /> waiting for your DM…
      </div>
    </div>
  );
}
