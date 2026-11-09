import Link from "next/link";
import { Footer, LoveShell } from "@/components/ui";

export const metadata = { title: "Community Safety" };

export default function SafetyPage() {
  return (
    <LoveShell>
      <div className="card w-full p-8 text-left text-ink">
        <Link href="/" className="text-xs font-black text-hot hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-black">Safety at No Names</h1>
        <p className="mt-1 text-xs text-muted">Keeping crush culture fun, consensual, and safe.</p>

        <div className="mt-6 space-y-4 text-sm font-semibold text-zinc-700 leading-relaxed">
          <div className="rounded-2xl bg-pink-50 p-4">
            <h2 className="text-base font-black text-ink">🛡️ Zero Tolerance for Harassment</h2>
            <p className="mt-1 text-xs text-zinc-600">
              No Names was engineered so you never face unsolicited messages, creepy outreach, or hate from strangers.
              Because you only connect when feelings are mutual, one-way intimidation is physically impossible on the platform.
            </p>
          </div>

          <section>
            <h3 className="text-base font-black text-ink">1. Strictly 18+</h3>
            <p>
              We enforce an 18+ age verification gate during signup. If an account is discovered to be operated by a minor,
              it is permanently terminated without notice.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-ink">2. Silent Removal & 30-Day Expiry</h3>
            <p>
              Changed your mind? Remove a crush quietly from your list at any time. The other user is never notified.
              Crushes also naturally expire every 30 days unless you deliberately renew them.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-ink">3. Instant Block & Unmatch</h3>
            <p>
              Matched with someone you no longer wish to interact with? Use the safety tools on any match screen to block
              them. Blocking hides the match, breaks future match attempts, and silences all connection.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-ink">4. Permanent Opt-Out</h3>
            <p>
              Anyone can opt their Instagram handle out of No Names at any time by visiting our{" "}
              <Link href="/opt-out" className="text-hot underline">
                opt-out page
              </Link>{" "}
              or by sending a DM with &ldquo;opt out&rdquo; to @nonames.love.
            </p>
          </section>
        </div>
      </div>
      <Footer light />
    </LoveShell>
  );
}
