import Link from "next/link";
import { Footer, LoveShell } from "@/components/ui";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LoveShell>
      <div className="card w-full p-8 text-left text-ink">
        <Link href="/" className="text-xs font-black text-hot hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-black">Terms of Service</h1>
        <p className="mt-1 text-xs text-muted">Last updated: November 2026</p>

        <div className="mt-6 space-y-4 text-sm font-semibold text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-base font-black text-ink">1. Age Requirement (Strictly 18+)</h2>
            <p>
              You must be at least eighteen (18) years old to create an account or use No Names. If you are under 18,
              do not attempt to register or use this platform. We actively terminate accounts found to belong to minors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black text-ink">2. Mutual Anonymity</h2>
            <p>
              No Names allows you to add up to five (5) Instagram usernames to your secret crush list. Your identity is
              never revealed unless the other party also registers and independently adds your verified Instagram
              username. You agree not to use the service for harassment, stalking, intimidation, or impersonation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black text-ink">3. Instagram Ownership Verification</h2>
            <p>
              You may only claim and verify an Instagram handle that belongs to you. You verify ownership by initiating a
              direct message containing a unique verification code to our designated bot account. Automated cold-messaging
              or unauthorized access attempts are strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black text-ink">4. Content & Conduct</h2>
            <p>
              Users may not submit false reports, abuse the opt-out mechanism, or attempt to de-anonymize other users
              without their explicit consent through a mutual match. Violations will result in an immediate permanent ban.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black text-ink">5. Disclaimer</h2>
            <p>
              No Names is provided &ldquo;as is&rdquo; without warranties of any kind. No Names is an independent service
              and is not endorsed, sponsored, or affiliated with Instagram or Meta Platforms, Inc.
            </p>
          </section>
        </div>
      </div>
      <Footer light />
    </LoveShell>
  );
}
