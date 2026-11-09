import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. See .env.example and SETUP.md.`);
  return v;
}

export const env = {
  get siteUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  /** Instagram handle of the verification bot, without @ */
  get botHandle() {
    return (process.env.NEXT_PUBLIC_IG_BOT_HANDLE ?? "nonames.love").replace(/^@/, "");
  },
  get metaAppSecret() {
    return process.env.META_APP_SECRET ?? "";
  },
  get metaVerifyToken() {
    return process.env.META_WEBHOOK_VERIFY_TOKEN ?? "";
  },
  get igAccessToken() {
    return process.env.IG_ACCESS_TOKEN ?? "";
  },
  get graphVersion() {
    return process.env.META_GRAPH_VERSION ?? "v23.0";
  },
  get resendKey() {
    return process.env.RESEND_API_KEY ?? "";
  },
  get emailFrom() {
    return process.env.EMAIL_FROM ?? "No Names <hello@nonames.love>";
  },
  get cronSecret() {
    return process.env.CRON_SECRET ?? "";
  },
  get adminEmails(): string[] {
    return (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  },
  baseSlots: 5,
  crushDays: 30,
};
