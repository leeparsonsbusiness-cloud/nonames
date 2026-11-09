import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer, LoveShell } from "@/components/ui";
import { parseUsername } from "@/lib/username";
import { getViewer } from "@/lib/session";
import { getProfileByUsername, incomingCount, isOptedOut } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/check/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}: someone might have a crush 👀` };
}

export default async function CheckPage({ params }: PageProps<"/check/[username]">) {
  const { username: raw } = await params;
  const username = parseUsername(decodeURIComponent(raw));
  if (!username) notFound();

  if (await isOptedOut(username)) {
    return (
      <LoveShell>
        <div className="card w-full p-8 text-center text-ink">
          <div className="text-5xl">🙅</div>
          <h1 className="mt-4 text-2xl font-black">@{username} opted out</h1>
          <p className="mt-2 font-semibold text-muted">This account can&apos;t be added on No Names.</p>
          <Link href="/" className="btn-hot mt-6 w-full">
            Check someone else
          </Link>
        </div>
        <Footer light />
      </LoveShell>
    );
  }

  const viewer = await getViewer();
  const isOwner = Boolean(viewer?.isVerified && viewer.profile.ig_username === username);
  const owner = isOwner ? viewer!.profile : await getProfileByUsername(username);
  const showCount = isOwner || Boolean(owner?.show_count_public);
  const count = showCount ? await incomingCount(username) : null;

  return (
    <LoveShell>
      <div className="card w-full p-8 text-center text-ink">
        <div className="text-sm font-black uppercase tracking-widest text-hot">@{username}</div>

        {isOwner ? (
          <>
            {count && count > 0 ? (
              <>
                <div className="animate-pop mt-4 text-6xl">🔥</div>
                <h1 className="mt-2 text-3xl font-black">
                  {count} {count === 1 ? "person has" : "people have"} a crush on you
                </h1>
                <p className="mt-2 font-semibold text-muted">
                  Add your crushes. If any of them picked you, it&apos;s instantly mutual 💘
                </p>
              </>
            ) : (
              <>
                <div className="mt-4 text-6xl">🌱</div>
                <h1 className="mt-2 text-3xl font-black">No crushes yet</h1>
                <p className="mt-2 font-semibold text-muted">Add yours. They might be waiting for you 👀</p>
              </>
            )}
            <Link href="/crushes" className="btn-hot mt-6 w-full">
              Go to my crush list 💌
            </Link>
          </>
        ) : showCount ? (
          <>
            <div className="mt-4 text-6xl">{count ? "🔥" : "🌱"}</div>
            <h1 className="mt-2 text-3xl font-black">
              {count ? `${count} secret admirer${count === 1 ? "" : "s"}` : "No admirers yet"}
            </h1>
            <p className="mt-2 font-semibold text-muted">@{username} is showing off their count 😏</p>
            <Link href="/start" className="btn-hot mt-6 w-full">
              Crushing on them? Add them secretly 🤫
            </Link>
          </>
        ) : (
          <>
            <div className="animate-floaty mt-4 text-6xl">👀</div>
            <h1 className="mt-2 text-3xl font-black">Someone might have a crush on @{username}</h1>
            <p className="mt-2 font-semibold text-muted">
              Is this you? Verify your account to see your exact count. Only you can see it.
            </p>
            <Link href="/start" className="btn-hot mt-6 w-full">
              It&apos;s me, show me 💘
            </Link>
            <Link href="/start" className="btn-ghost mt-2 w-full text-base text-grape">
              Crushing on @{username}? Add them secretly
            </Link>
          </>
        )}
      </div>
      <Footer light />
    </LoveShell>
  );
}
