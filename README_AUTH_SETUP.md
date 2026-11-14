# Atlas v0.4 — Email OTP configuration

## 1. Edit exactly one file

Open `atlas.config.json` and replace the two placeholders:

```json
{
  "allowedEmail": "you@example.com",
  "dexieCloudUrl": "https://YOUR_REAL_DATABASE.dexie.cloud"
}
```

This file is imported at **build time** by Vite (including Cloudflare Pages builds). Commit changes to GitHub to deploy the updated settings. Values in this file are **public** in the compiled frontend; never store a password, OTP, `dexie-cloud.key`, secret token or API private key here. The allowedEmail value only selects the intended login identity in the UI — it is **not a server-enforced email allowlist**. Dexie Cloud verifies the OTP and enforces per-user private data isolation.

## 2. Create a Dexie Cloud database (one time)

From the project directory:

```bash
npm install
npx dexie-cloud create
```

The CLI sends an email OTP to the database creator. Copy the resulting database URL (also in local `dexie-cloud.json`) into `atlas.config.json`. The `dexie-cloud.key` file is **privileged** and is already gitignored. NEVER push it to GitHub or put it in the PWA. Set `allowedEmail` to the same verified email you will use to log in. The creator email need not equal the user email, but for a personal account using the same email is simplest.

## 3. Authorize origins

When developing at http://localhost:5173:

```bash
npx dexie-cloud whitelist http://localhost:5173
```

After setting up your deployment URL, whitelist the exact Cloudflare Pages URL, e.g.:

```bash
npx dexie-cloud whitelist https://YOUR_PROJECT.pages.dev
```

Do this from a local directory containing the privileged CLI key. Do not upload the key to Cloudflare.

## 4. Local and deployed behavior

- `npm run dev` with placeholder config allows **local-only development** and shows a banner (not secure).
- A production build with placeholder config shows a **setup required** screen, never the workspace.
- When the cloud URL and email are configured, Dexie Cloud handles OTP email and persistent device login; Atlas only renders the private workspace if the signed-in email matches `allowedEmail`.
- No SMTP server, Flask backend, or custom OTP handler is required.

## 5. Important migration note — do NOT skip

When Dexie Cloud activates, it uses a database name that includes a suffix based on your cloud database URL. This means **old offline data does not automatically appear in your new cloud workspace**. Before activating the cloud settings, export an Atlas JSON backup from v0.3.2, then sign in to the new cloud-connected app and import it. Test on one device before enabling another. Do not delete the old browser database until you have verified the restored data and successful sync.

## 6. Security boundaries

- `allowedEmail` is a *client-side UI restriction*, not a true server-side whitelist of who may register. By default, Dexie Cloud allows email OTP sign-in but private data belongs to the signed-in user and other users cannot see it absent a grant.
- A production web page's HTML/JS can still be publicly downloaded on Cloudflare Pages unless a separate access policy is installed.
- The synced account/data separation must be verified in a real Dexie Cloud test before any production deployment.
- Anyone who controls your allowed email inbox can receive the OTP. Enable MFA on the email account.
- Sign-out may clear local session/data; back up before testing sign-out, particularly while offline.
- If you want to prevent other email accounts from *even registering*, that requires an independent server-side access policy (e.g. Cloudflare Access), not only this JSON config.

## 7. Not yet verified

Build and complete Dexie Cloud sync have not been end-to-end verified in Safari on macOS/iOS. Test network interruption, reauthentication, private data permissions, cross-device sync and database upgrades before publishing real data.
