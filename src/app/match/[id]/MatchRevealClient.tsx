"use client";

import { useState } from "react";
import { MatchSafety } from "./MatchSafety";

const ICEBREAKERS = [
  "Okay be real... who added who first? 😂",
  "I had a feeling it was you 👀",
  "Well, No Names brought us here... drinks this weekend? 🥂",
  "Guess our secret is officially out 🤫💘",
];

export function MatchRevealClient({
  matchId,
  myUsername,
  otherUsername,
  otherId,
  dmUrl,
}: {
  matchId: string;
  myUsername: string;
  otherUsername: string;
  otherId: string;
  dmUrl: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copiedIcebreaker, setCopiedIcebreaker] = useState<string | null>(null);
  const [storyCopied, setStoryCopied] = useState(false);

  const copyIcebreaker = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIcebreaker(text);
      setTimeout(() => setCopiedIcebreaker(null), 2500);
    } catch {}
  };

  const shareToStory = async () => {
    const text = `Just secretly matched with someone on No Names 💘 Check your crushes at https://nonames.love`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "It's Mutual! 💘", text, url: "https://nonames.love" });
        return;
      } catch {}
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setStoryCopied(true);
      setTimeout(() => setStoryCopied(false), 2500);
    }
  };

  // Stage 1: Suspense Heartbeat Screen
  if (!revealed) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-pop">
        <div className="relative flex items-center justify-center">
          <div className="size-36 rounded-full bg-white/20 animate-ping absolute" />
          <div className="size-32 rounded-full bg-white/30 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(255,255,255,0.8)] backdrop-blur animate-bounce">
            💓
          </div>
        </div>

        <h2 className="mt-8 text-3xl font-black uppercase tracking-tight text-white drop-shadow">
          Unmasking Crush…
        </h2>
        <p className="mt-2 text-base font-bold text-white/90 max-w-xs">
          Someone on your crush list secretly picked you back!
        </p>

        <button
          onClick={() => setRevealed(true)}
          className="btn-white mt-8 px-10 py-5 text-xl font-black text-ink shadow-[0_10px_35px_rgba(255,255,255,0.4)] transition hover:scale-105 active:scale-95"
        >
          Reveal Who It Is! 💥
        </button>
      </div>
    );
  }

  // Stage 2, 3, 4: Full Celebratory Reveal
  return (
    <div className="flex flex-col items-center text-center animate-pop">
      {/* Emojis & Title */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl animate-bounce">💖</span>
        <span className="text-4xl animate-pulse">✨</span>
        <span className="text-3xl animate-bounce">💘</span>
      </div>

      <h1 className="mt-3 text-4xl sm:text-5xl font-black uppercase tracking-tight drop-shadow-md">
        IT&apos;S MUTUAL 💘
      </h1>

      {/* Glowing connected avatars */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <div className="flex size-24 items-center justify-center rounded-full bg-white/20 text-3xl font-black shadow-[0_0_25px_rgba(255,255,255,0.7)] backdrop-blur border-2 border-white">
            👤
          </div>
          <span className="mt-2 text-sm font-black text-white/95">@{myUsername}</span>
        </div>

        <div className="flex size-12 items-center justify-center rounded-full bg-hot shadow-lg text-xl animate-floaty">
          ❤️
        </div>

        <div className="flex flex-col items-center">
          <div className="flex size-24 items-center justify-center rounded-full bg-white/20 text-3xl font-black shadow-[0_0_25px_rgba(255,255,255,0.7)] backdrop-blur border-2 border-white">
            👤
          </div>
          <span className="mt-2 text-sm font-black text-white/95">@{otherUsername}</span>
        </div>
      </div>

      <p className="mt-6 text-lg font-bold text-white/90">
        You both secretly added each other. No more guessing.
      </p>

      {/* Slide into DMs CTA */}
      <a
        href={dmUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-white mt-7 w-full py-5 text-xl font-black text-ink shadow-2xl transition hover:scale-[1.02] active:scale-[0.98]"
      >
        Slide into their DMs 💬
      </a>

      {/* Stage 3: Icebreaker Generator */}
      <div className="card mt-8 w-full p-5 text-left text-ink shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-hot">Icebreakers (Tap to Copy)</h3>
          <span className="text-[11px] font-bold text-muted">Kill the awkwardness 🧊</span>
        </div>

        <div className="mt-3 space-y-2">
          {ICEBREAKERS.map((text) => {
            const isCopied = copiedIcebreaker === text;
            return (
              <button
                key={text}
                onClick={() => copyIcebreaker(text)}
                className={`w-full rounded-2xl p-3 text-left text-xs font-bold transition flex items-center justify-between gap-2 border ${
                  isCopied
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-hot hover:bg-pink-50/50"
                }`}
              >
                <span>{text}</span>
                <span className="text-[11px] shrink-0 font-extrabold text-hot">
                  {isCopied ? "COPIED ✅" : "COPY 📋"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage 4: Viral Story Flex */}
      <div className="mt-6 w-full">
        <button
          onClick={shareToStory}
          className="w-full rounded-2xl border-2 border-dashed border-white/50 bg-white/10 py-3.5 text-sm font-black text-white hover:bg-white/20 transition flex items-center justify-center gap-2"
        >
          <span>📸</span>
          <span>{storyCopied ? "Copied Story Caption! ✨" : "Share Anonymous Flex to Story ✨"}</span>
        </button>
        <p className="mt-1.5 text-[11px] font-semibold text-white/70">
          (Keeps their name private, but flexes to UCLA that you just matched!)
        </p>
      </div>

      <MatchSafety matchId={matchId} otherId={otherId} otherUsername={otherUsername} />
    </div>
  );
}
