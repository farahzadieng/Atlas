> **نسخه فعلی v0.3:** تغییرات تازه را در `CHANGES_v0.3.md` و راه‌اندازی Apple Shortcuts را در `APPLE_SHORTCUTS_SETUP.md` ببینید.

# Atlas v0.2 — Personal Knowledge Manager

A private, Persian RTL, card-based local-first PWA built with React + TypeScript + Dexie.

## Start

Requires Node.js compatible with Vite 7 (Node 20.19+ or 22.12+).

```bash
npm install
npm run dev
```

Open the localhost address shown by Vite. To test production/PWA:

```bash
npm run build
npm run preview
```

PWA install and offline caching work best on localhost or HTTPS. Test offline after opening the production preview while online at least once.

## Implemented

- Projects with `active`, `rest`, `suspended`, `completed` statuses and separate archival
- Dedicated project notebooks, sorted by event date (newest first); pinned cards first
- `task`, `log`, `note`, `checklist`, `decision` cards
- Markdown preview and rendered GFM, interactive checklist toggles; unsafe raw HTML not enabled
- Multiple main tasks per project, surfaced on dashboard
- Task statuses, priorities, due dates, `.ics` file export for Apple Calendar import
- Prompt library, favorites, tag filter and body copy
- Inbox quick capture and conversion to a card when assigned to a project
- Dashboard, activity audit trail, search, mobile navigation, responsive light/dark themes
- Local AradVF font (`public/fonts/AradVF.woff2`)
- JSON backup/export and merge import, including support for version 1 backups
- Markdown export per project

## Important limitations

- **Not deployed.** No external services configured.
- **No Dexie Cloud yet.** Data stays in IndexedDB on the current browser/device; there is no cross-device sync and browser data removal can delete it. Export backups frequently.
- Apple Calendar: exports an all-day `.ics` based on task due date, and the user imports it manually. This is **not** live sync.
- Apple Reminders: direct creation and Shortcuts bridge **not yet implemented**, pending testing on target Apple devices.
- No automatic background sync, push notifications, or end-to-end encryption.
- Browser PWA installation support differs by platform; SVG icon is included, and raster icons may be added for broader installation support.
- Import is merge/upsert, not replacement; keep backups in a safe place and avoid importing untrusted JSON.
- User-provided font is bundled for personal use; verify font distribution license before sharing or publishing the code.

## Data migration

This version uses the **same Dexie database name `atlas-local-v1`** as the earlier v0.1 and upgrades it to schema version 2. Prior projects and inbox entries remain. Legacy `paused` becomes `rest` and legacy `archived` becomes `rest` with archival timestamp. Always export a backup from v0.1 before opening v0.2 on the same origin.

## Design decisions

- Markdown is stored as source text, not as HTML.
- Multiple `isMainTask` cards are allowed within any project.
- Date of event is distinct from timestamps of creation/update and task due date.
- Archive is a separate field from project status.
- Theme preference is device-local.
- Database architecture is designed for later sync integration, but **Dexie Cloud requires additional schema and identity/security review** before enabling sync. Do not assume switching it on is just a config flag.

## Apple Deep Links (iPhone and macOS Safari)
See `APPLE_DEEPLINK_SETUP.md`. Task due dates now support selecting both date and time. No direct EventKit integration or two-way Apple sync is implied.
