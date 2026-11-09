import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`relative inline-block text-3xl font-black tracking-tight ${light ? "text-white" : "text-ink"}`}>
      no names
      <span className="absolute -right-6 -top-3 text-2xl" aria-hidden>
        😍
      </span>
    </Link>
  );
}

/** Soft pink app shell used by logged-in pages. */
export function AppShell({ children, title, right }: { children: React.ReactNode; title?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <main className="bg-soft min-h-dvh px-4 pb-16 pt-6">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-3 text-sm font-extrabold text-muted">{right}</nav>
        </header>
        {title ? <h1 className="mb-4 text-3xl font-black text-ink">{title}</h1> : null}
        {children}
      </div>
    </main>
  );
}

/** Gradient shell used by marketing / onboarding pages. */
export function LoveShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-love min-h-dvh px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-8 mt-4">
          <Logo light />
        </div>
        {children}
      </div>
    </main>
  );
}

export function AppNav() {
  return (
    <>
      <Link href="/crushes" className="hover:text-hot">
        crushes
      </Link>
      <Link href="/settings" className="hover:text-hot">
        ⚙️
      </Link>
    </>
  );
}

export function Footer({ light = false }: { light?: boolean }) {
  return (
    <footer className={`mt-10 flex flex-wrap justify-center gap-4 text-xs font-bold ${light ? "text-white/70" : "text-muted"}`}>
      <Link href="/safety">safety</Link>
      <Link href="/opt-out">opt out</Link>
      <Link href="/terms">terms</Link>
      <Link href="/privacy">privacy</Link>
      <span>18+ only</span>
    </footer>
  );
}
