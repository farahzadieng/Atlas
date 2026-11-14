# Atlas v0.2 implementation acceptance checklist

## Architecture locked
- Local-first React PWA; offline data in IndexedDB via Dexie
- `projects`, `cards`, `prompts`, `inbox`, `activity`
- **Multiple simultaneous main tasks per project:** `cards.isMainTask` boolean (no uniqueness constraint)
- Four project statuses (`active`, `rest`, `suspended`, `completed`) + `archivedAt`
- Card types: task, log, note, checklist, decision
- Project page card order: pinned first, then `eventDate` descending, then created timestamp descending
- Markdown source preserved; GFM rendered safely without accepting raw HTML
- Date fields: `eventDate` (event), `dueAt` (task due), `createdAt`, `updatedAt`, `completedAt`
- Device-local theme; local AradVF font

## Manual acceptance test (after npm install)
1. `npm run dev`: navigate Dashboard, Projects, Planner, Prompts, Inbox and Settings.
2. Create Project A with status `active`; change to `rest`, then `suspended`, then `completed`.
3. Create two `task` cards in Project A, both marked main. Confirm both appear in dashboard.
4. Create a log dated yesterday, then one today. Confirm timeline order.
5. Paste `- [ ] Item` into a card and click checkbox in the rendered card. Refresh and verify persisted.
6. Create prompt with tags, search by tag and body, copy text.
7. Switch light/dark and refresh.
8. Export JSON backup; edit data; reimport backup and confirm relevant fields restore.
9. Add a due date and export an `.ics`; inspect/import file on the target calendar.
10. Build/preview; install PWA and test offline after visiting online once.
11. On a device with v0.1 data on the same origin, confirm migration and backup first.

## Not in v0.2
- Dexie Cloud setup and real-time cross-device synchronization
- Apple Reminders Shortcut integration
- Bidirectional Apple Calendar sync
- Auto notifications, login, server, deployment

## Build verification
Source code TS/TSX syntax has been parsed successfully with system TypeScript. A complete `npm install` and `npm run build` **have not been verified in this environment** because dependencies were not available through npm cache/network. Run these commands locally before treating the package as build-verified.
