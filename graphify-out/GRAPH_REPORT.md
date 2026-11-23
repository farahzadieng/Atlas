# Graph Report - Atlas  (2026-11-23)

## Corpus Check
- 44 files · ~65,407 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .woff2 1, .css 1)

## Summary
- 218 nodes · 492 edges · 22 communities (10 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 0% INFERRED · 1% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Application and Cards
- Authentication and Settings
- Navigation and Presentation
- Data Model and Forms
- TypeScript Configuration
- Inbox and Database Tests
- Documentation and Setup
- Prompts and Tags
- Package and Build Tools
- HTML App Shell
- Formatting Configuration
- Source App Icon
- Favicon Artwork
- Large App Icon
- Maskable App Icon
- Apple Touch Icon
- Small Favicon
- Small App Icon
- Vector App Icon

## God Nodes (most connected - your core abstractions)
1. `App()` - 20 edges
2. `Project` - 18 edges
3. `compilerOptions` - 16 edges
4. `Card` - 12 edges
5. `textMatches()` - 12 edges
6. `Empty()` - 11 edges
7. `Page` - 10 edges
8. `saveSettings()` - 9 edges
9. `Atlas personal knowledge manager` - 9 edges
10. `Bootstrap()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Build time atlas.config.json` --conceptually_related_to--> `Device local connection settings`  [AMBIGUOUS]
  README_AUTH_SETUP.md → README.md
- `App()` --calls--> `textMatches()`  [EXTRACTED]
  src/App.tsx → src/presentation.ts
- `InboxProps` --references--> `Project`  [EXTRACTED]
  src/views/Inbox.tsx → src/db.ts
- `SettingsProps` --references--> `Project`  [EXTRACTED]
  src/views/Settings.tsx → src/db.ts
- `PromptsProps` --references--> `Prompt`  [EXTRACTED]
  src/views/Prompts.tsx → src/db.ts

## Import Cycles
- None detected.

## Communities (22 total, 12 thin omitted)

### Community 0 - "Application and Cards"
Cohesion: 0.08
Nodes (20): App(), toggleChecklist(), updateCard(), CardModal(), dateFmt(), dueFmt(), Empty(), Markdown() (+12 more)

### Community 1 - "Authentication and Settings"
Cohesion: 0.13
Nodes (13): logout(), ProjectCategory, DeviceSettings, loadSettings(), normalizeSettings(), openSettingsDb(), saveSettings(), setBootSettings() (+5 more)

### Community 2 - "Navigation and Presentation"
Cohesion: 0.23
Nodes (20): Activity, Card, Project, Page, sendToApple(), statusText, textMatches(), timeFmt() (+12 more)

### Community 3 - "Data Model and Forms"
Cohesion: 0.14
Nodes (15): CardType, ChecklistItem, Priority, ProjectType, Prompt, TaskStatus, CardModal(), ProjectModal() (+7 more)

### Community 4 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 5 - "Inbox and Database Tests"
Cohesion: 0.17
Nodes (5): InboxItem, InboxKind, InboxComposer(), Inbox(), InboxProps

### Community 6 - "Documentation and Setup"
Cohesion: 0.15
Nodes (14): Legacy email OTP configuration, Build time atlas.config.json, Client side allowed email check, Offline to cloud backup migration, Dexie Cloud origin whitelist, Apple Shortcuts deep links, Atlas personal knowledge manager, Cloudflare static deployment (+6 more)

### Community 7 - "Prompts and Tags"
Cohesion: 0.38
Nodes (7): PromptModal(), submit(), cleanTag(), getPromptTagSuggestions(), parsePromptTags(), selectPromptTag(), prompts

### Community 8 - "Package and Build Tools"
Cohesion: 0.20
Nodes (6): dexie-react-hooks, lucide-react, react, react-dom, react-markdown, remark-gfm

### Community 10 - "HTML App Shell"
Cohesion: 0.50
Nodes (4): React main.tsx entry point, Unresolved HTML merge conflict, Persian RTL application shell, PWA and Apple icon metadata

## Ambiguous Edges - Review These
- `Atlas personal knowledge manager` → `Apple Shortcuts deep links`  [AMBIGUOUS]
  README.md · relation: references
- `Atlas personal knowledge manager` → `Device local connection settings`  [AMBIGUOUS]
  README.md · relation: references
- `Atlas personal knowledge manager` → `Dexie Cloud authentication and sync`  [AMBIGUOUS]
  README.md · relation: references
- `Device local connection settings` → `Build time atlas.config.json`  [AMBIGUOUS]
  README_AUTH_SETUP.md · relation: conceptually_related_to

## Knowledge Gaps
- **50 isolated node(s):** `singleQuote`, `semi`, `dexie-react-hooks`, `lucide-react`, `react` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 88 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Atlas personal knowledge manager` and `Apple Shortcuts deep links`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `App()` connect `Application and Cards` to `Authentication and Settings`, `Navigation and Presentation`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `singleQuote`, `semi`, `dexie-react-hooks` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application and Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.08258258258258258 - nodes in this community are weakly interconnected._
- **What is the exact relationship between `Atlas personal knowledge manager` and `Device local connection settings`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `Project` connect `Navigation and Presentation` to `Application and Cards`, `Authentication and Settings`, `Data Model and Forms`, `Inbox and Database Tests`, `Prompts and Tags`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `Authentication and Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._