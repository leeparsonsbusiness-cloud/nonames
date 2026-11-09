import { notFound } from "next/navigation";
import Link from "next/link";
import { requireViewer } from "@/lib/session";
import { getMatchForUser } from "@/lib/data";
import { igDmLink } from "@/lib/instagram";
import { MatchRevealClient } from "./MatchRevealClient";

export const metadata = { title: "IT'S MUTUAL 💘" };

export default async function MatchPage({ params }: PageProps<"/match/[id]">) {
  const viewer = await requireViewer();
  const { id } = await params;

  const match = await getMatchForUser(id, viewer.userId);
  if (!match) notFound();

  const myUsername = viewer.profile.ig_username ?? "you";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-love px-4 py-8 text-white">
      {/* Decorative falling confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti-piece absolute size-2.5 rounded-sm opacity-80"
            style={{
              left: `${(i * 5.2) % 100}%`,
              backgroundColor: ["#ffffff", "#fef08a", "#f472b6", "#60a5fa", "#a78bfa"][i % 5],
              animation: `fall ${3 + (i % 3)}s linear infinite`,
              animationDelay: `${(i * 0.25) % 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        <Link href="/crushes" className="self-start text-sm font-extrabold text-white/80 hover:text-white">
          ← Back to crushes
        </Link>

        <div className="mt-4 w-full">
          <MatchRevealClient
            matchId={match.id}
            myUsername={myUsername}
            otherUsername={match.otherUsername}
            otherId={match.otherId}
            dmUrl={igDmLink(match.otherUsername)}
          />
        </div>
      </div>
    </main>
  );
}
