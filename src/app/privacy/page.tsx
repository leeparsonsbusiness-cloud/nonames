import Link from "next/link";
import { Footer, LoveShell } from "@/components/ui";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LoveShell>
      <div className="card w-full p-8 text-left text-ink">
        <Link href="/" className="text-xs font-black text-hot hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-black">Privacy Policy</h1>
        <p className="mt-1 text-xs text-muted">Last updated: November 2026</p>

        <div className="mt-6 space-y-4 text-sm font-semibold text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-base font-black text-ink">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-ink">Account Email:</strong> Used exclusively for passwordless magic link logins.</li>
              <li><strong className="text-ink">Date of Birth:</strong> Used solely to verify that you are at least 18 years old. We do not display your birthdate publicly.</li>
              <li><strong className="text-ink">Verified Instagram Username:</strong> Obtained when you send your one-time verification code via direct message to our bot.</li>
              <li><strong className="text-ink">Crush Selections:</strong> The target usernames you submit. These are stored securely in encrypted databases.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-black text-ink">2. How Data is Shared</h2>
            <p>
              Your crush list is never visible to the public or to other users. A user&apos;s identity is revealed to another
              party <strong className="text-hot">only if and when both users mutually add each other</strong>.
              We do not sell your personal data or provide it to third-party data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black text-ink">3. Data Retention & Expiry</h2>
            <p>
              Crush selections automatically expire after thirty (30) days unless actively renewed. If you remove a crush,
              the record is marked as deleted immediately. You can delete your entire account and all associated data
              at any time in your Settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black text-ink">4. Opt-Out Registry</h2>
            <p>
              Any person may place their Instagram username on our opt-out registry. Once registered, no user may add
              that username to their crush list, and existing pending crushes pointing to that username are removed.
            </p>
          </section>
        </div>
      </div>
      <Footer light />
    </LoveShell>
  );
}
