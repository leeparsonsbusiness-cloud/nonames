import "server-only";
import { env } from "@/lib/env";

/** Send a transactional email through Resend's REST API. Logs instead when no key is configured. */
export async function sendEmail(to: string, subject: string, body: { title: string; text: string; cta?: { label: string; url: string } }) {
  const html = `
  <div style="font-family:Nunito,Arial,sans-serif;background:#fdf2f8;padding:32px">
    <div style="max-width:440px;margin:0 auto;background:#fff;border-radius:24px;padding:32px;text-align:center">
      <div style="font-size:28px;font-weight:900;background:linear-gradient(90deg,#ec4899,#8b5cf6);-webkit-background-clip:text;color:#db2777">no names</div>
      <h1 style="font-size:24px;color:#1f1235;margin:20px 0 8px">${body.title}</h1>
      <p style="color:#6b5b7b;font-size:16px;line-height:1.5">${body.text}</p>
      ${
        body.cta
          ? `<a href="${body.cta.url}" style="display:inline-block;margin-top:16px;background:#ec4899;color:#fff;text-decoration:none;font-weight:800;padding:14px 28px;border-radius:999px">${body.cta.label}</a>`
          : ""
      }
      <p style="color:#b8a9c9;font-size:12px;margin-top:28px">No names. Until it's mutual. 💘</p>
    </div>
  </div>`;

  if (!env.resendKey) {
    console.log(`[email:dry-run] to=${to} subject="${subject}" ${body.cta?.url ?? ""}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.emailFrom, to, subject, html }),
  });
  if (!res.ok) console.error("[email] send failed", res.status, await res.text().catch(() => ""));
}
