import Link from "next/link";
import { AppNav, AppShell, Footer } from "@/components/ui";
import { requireViewer } from "@/lib/session";
import { signOutAction } from "@/app/start/actions";
import { deleteAccountAction, optOutSelfAction, updatePreferencesAction } from "./actions";

export const metadata = { title: "settings" };

export default async function SettingsPage() {
  const viewer = await requireViewer();
  const { profile } = viewer;

  return (
    <AppShell title="settings ⚙️" right={<AppNav />}>
      <div className="card space-y-6 p-6">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-muted">Account</h2>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-muted">Instagram</span>
            <span className="text-base font-black text-ink">@{profile.ig_username}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-muted">Email</span>
            <span className="text-sm font-semibold text-ink">{profile.email}</span>
          </div>
        </div>

        <hr className="border-zinc-100" />

        <form action={updatePreferencesAction} className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted">Privacy & Hints</h2>

          <label className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-extrabold text-ink">Show my crush count publicly</div>
              <div className="text-xs font-semibold text-muted">
                Anyone checking your link sees your count as a flex. (Default is off: only you see your count).
              </div>
            </div>
            <input
              type="checkbox"
              name="show_count_public"
              defaultChecked={profile.show_count_public}
              className="size-5 accent-pink-500 rounded cursor-pointer mt-1"
            />
          </label>

          <label className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-extrabold text-ink">Allow revealing hints about me</div>
              <div className="text-xs font-semibold text-muted">
                If someone who has a crush on you buys a hint, allow clues like the first letter of your handle.
                (Off by default).
              </div>
            </div>
            <input
              type="checkbox"
              name="allow_revealing_hints"
              defaultChecked={profile.allow_revealing_hints}
              className="size-5 accent-pink-500 rounded cursor-pointer mt-1"
            />
          </label>

          <button type="submit" className="btn-hot w-full py-3 text-base">
            Save Preferences
          </button>
        </form>

        <hr className="border-zinc-100" />

        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted">Actions</h2>

          <form action={signOutAction}>
            <button className="w-full rounded-2xl bg-zinc-100 py-3 text-sm font-extrabold text-zinc-700 hover:bg-zinc-200 transition">
              Sign out
            </button>
          </form>

          <form action={optOutSelfAction}>
            <button
              onClick={() => {
                if (!confirm("Are you sure? Your username will be permanently blocked from being added on No Names.")) {
                  return false;
                }
              }}
              className="w-full rounded-2xl border border-red-200 bg-red-50/50 py-3 text-sm font-extrabold text-red-600 hover:bg-red-100 transition"
            >
              Opt out @{profile.ig_username} permanently
            </button>
          </form>

          <form action={deleteAccountAction}>
            <button
              onClick={() => {
                if (!confirm("Delete account? All your crushes, matches, and data will be erased forever.")) {
                  return false;
                }
              }}
              className="w-full text-center text-xs font-bold text-zinc-400 hover:text-red-500 transition py-2"
            >
              Delete account & data
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </AppShell>
  );
}
