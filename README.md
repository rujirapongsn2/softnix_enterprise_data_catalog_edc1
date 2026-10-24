# Softnix Enterprise Data Catalog — UI prototype

Frontend-only prototype of the EDC web app from the PRD (Oct 9, 2026). All data is mock data in `src/data/mock.ts`; no backend yet.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Screens

| Route | Screen | PRD |
| --- | --- | --- |
| `/` | Home: KPIs, my tasks, followed assets, AI curation, harvest health | AUD-02, WF-04, SRC-05 |
| `/search` | Search with facets, ranking, saved search, AI hint | SRC-01–04, AI-01 |
| `/asset/:id` | Asset detail: overview, columns + profiling, lineage, DQ, access, history, discussion, request access, report issue | CAT, CLS, LIN, DQ, ACC, AUD, SRC-05 |
| `/glossary/:id` | Glossary tree, ISO 11179 status, KPI formula, linked assets | GLO |
| `/domains` | Domains and data products | CAT-09 |
| `/inbox` | Workflow tasks with stepper, AI summary, approve/reject | WF |
| `/privacy` | PII review queue, inventory, RoPA records | CLS-02–06, AI-03 |
| `/quality` | DQ overview, issues | DQ |
| `/access` | Policy register, classification scheme, access reviews | ACC, CLS-01 |
| `/dashboard` | Governance metrics vs targets by domain | AUD-02, §2.3 |
| `/sources` | Connectors, harvest runs | HRV |
| `/audit` | Hash-chained audit trail incl. AI and MCP calls | AUD, ASK-12, MCP-05 |
| `/settings` | AI providers & guardrails, MCP server, metamodel (+ New attribute) | AI-09/10, MCP, CAT-03 |
| `/roles` | Roles & Permissions: function × role matrix, role cards, users & IdP group mapping (+ Invite user) | §3, NFR-01 |

**Ask Softnix** (ASK-01–13) floats on every page: `⌘/Ctrl + J`, context-aware prompts, confirm-before-save action cards, hold-to-talk voice. Deep link: `?ask=<prompt>`.

Global search: `⌘/Ctrl + K`. Language toggle EN / ไทย in the top bar.

**Page Help** (`?` icon in the top bar, or `?help=1`): a right-side panel that explains the current page in the current language (EN / ไทย). The content is in `help-content/{en,th}/<page>.md` (Markdown + frontmatter, one file per page). `npm run help:index` validates it and builds `src/help/help-index.json` plus the RAG chunks at `public/help/help-chunks.jsonl`. See `help-content/README.md`.

## Roles & permissions (demo)

Avatar menu in the top bar → **Switch role**. The 8 roles come from PRD §3; the choice is stored in `localStorage` (`edc1.role`).
All menu items, page guards and gated buttons read one matrix: `src/auth/permissions.ts` (F = full, V = view only, - = none).
Pages a role cannot see show a "no access" card; view-only pages show a yellow banner and locked buttons (hover for who can).

## Create forms

Shared form kit: `src/components/form.tsx`. Forms: `src/forms/AddSource.tsx` (7-step wizard) and `src/forms/Forms.tsx`.
Records created in forms are kept in `localStorage` (`edc1.data.*`); **Roles & Permissions → Reset demo data** clears them.
