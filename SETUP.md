# 🚀 No Names: Setup & Launch Checklist

**"No names. Until it's mutual." 💘**

This document details the exact external accounts, API keys, and configurations needed to take No Names live on the web and launch at UCLA.

---

## ⚡ Fast-Track: How to Test Locally Today (Zero Waiting)

You do **not** have to wait for Meta or domain registrars to test the full flow right now:

1. **Create a Free Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project (e.g. `nonames-db`).
   - Open **SQL Editor** in Supabase and paste the entire contents of `supabase/migrations/001_init.sql`. Click **Run**.
   - Copy the **Project URL**, **anon key**, and **service_role key** (from Settings -> API).

2. **Set up `.env.local`**:
   - In `/Users/macbook/Downloads/nonames`, copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
   - Set `ADMIN_EMAILS=leeparsonsbusiness@gmail.com`.

3. **Start the App**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

4. **Test the Flow with the Admin Bypass**:
   - Sign up with your email at `http://localhost:3000/start`.
   - Complete the 18+ birthday gate.
   - When asked to verify on Instagram, navigate to `http://localhost:3000/admin`.
   - You will see your account listed under **Manual IG Verification (Beta / Test Bypass)**! Enter any Instagram username (e.g. `jordan.k`) and click **Verify**.
   - Your account is now fully verified. Add crushes, test mutual matching, and view the reveal screen.

---

## 📋 Production Setup Checklist

### 1. Domain Registration
- Buy **nonames.love** (or `getnonames.com`).
- In Vercel, navigate to Project Settings -> **Domains** -> add `nonames.love`.
- Add the CNAME / A records provided by Vercel into your GoDaddy DNS manager.

---

### 2. Instagram & Facebook Setup
To automate verification replies via DM, Instagram requires an **Instagram Professional (Business or Creator) Account** connected to a **Facebook Page**:

1. Create the Instagram account (e.g. `@nonames.love`).
2. Go to **Settings -> Account type and tools -> Switch to professional account** (choose Business).
3. Open or create a Facebook Page (e.g. "No Names").
4. In Instagram Settings -> **Business -> Connect or create a Facebook Page**, link the account.
5. In Instagram Settings -> **Messages and story replies -> Message controls**, enable **"Allow access to messages"** for connected tools.

---

### 3. Meta Developer App (Start this early: review takes 1–4 weeks)
1. Go to [developers.facebook.com](https://developers.facebook.com) and log in.
2. Click **Create App** -> Select **Other** -> App Type: **Business**.
3. Under **Add Products to Your App**, find **Instagram** (or "Instagram API with Instagram Login") and click **Set Up**.
4. In the App Dashboard -> **Settings -> Basic**:
   - Copy your **App Secret** into `META_APP_SECRET`.
   - Set Privacy Policy URL to `https://nonames.love/privacy`.
   - Set Terms of Service URL to `https://nonames.love/terms`.
5. Under **Instagram -> Webhooks**:
   - Callback URL: `https://nonames.love/api/instagram/webhook`
   - Verify Token: Create any random string (e.g. `my_secret_token_123`) and set `META_WEBHOOK_VERIFY_TOKEN`.
   - Subscribe to the `messages` field.
6. Generate a permanent Page/Instagram Access Token and set `IG_ACCESS_TOKEN`.

> 💡 **Tip:** While waiting for Meta App Review approval, add yourself and early UCLA beta testers under **App Roles -> Roles -> Instagram Testers**. Testers can use the live DM verification bot immediately before public approval!

---

### 4. Email (Resend)
1. Go to [resend.com](https://resend.com) (free 3,000 emails/month).
2. Generate an API Key and set `RESEND_API_KEY`.
3. Add `nonames.love` to Resend Domains, verify the 3 DNS records in GoDaddy, and set `EMAIL_FROM="No Names <hello@nonames.love>"`.

---

### 5. Automated Daily Expiry (Vercel Cron)
- `vercel.json` is already configured to invoke `GET /api/cron/expire` every day at 08:00 UTC.
- In your Vercel Project Settings -> Environment Variables, add `CRON_SECRET` with a secure random string.

---

## 🛡️ UCLA Launch Playbook
1. **Week 1 (Internal Beta):** Have 10–20 UCLA friends sign up. Use `/admin` to verify their usernames. Have them add each other and test mutual reveals.
2. **Week 2 (Story Campaign):** Users who added crushes can post the story teaser image:
   *"I just added my crushes on No Names 👀 Is it you? nonames.love"*
3. **Week 3 (Campus Push):** Share on campus Discord/Snapchat/Instagram. Anyone who checks their handle sees *"Someone might have a crush on you 👀"* and signs up to see if feelings are mutual.
