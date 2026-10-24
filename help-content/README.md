# EDC1 help content

Page-level help for the **?** icon in the top bar, and the knowledge base for a future Chat/RAG function ("how do I use the system?").
The help text is data, not JSX. Edit the Markdown files here and the Help panel and the RAG index both update.

```
help-content/
  en/<page_id>.md          English, one file per page
  th/<page_id>.md          Thai, same page_id, same section anchors
  README.md                this file
scripts/build-help-index.mjs   validator + index builder (no dependencies)
src/help/help-index.json       generated · bundled into the app (Help panel renders from it)
public/help/help-index.json    generated · served at /help/help-index.json
public/help/help-chunks.jsonl  generated · served at /help/help-chunks.jsonl (RAG chunks)
```

## Commands

```bash
npm run help:index   # validate + regenerate the three generated files
npm run help:check   # validate only (exit code 1 on any problem) — use in CI
npm run build        # runs help:index first, then tsc + vite build
```

`npm run dev` also regenerates the index once at start. After you edit a `.md` file while dev is running, run `npm run help:index` again.

## File format

```markdown
---
id: observability                # = file name, same in en/ and th/
lang: en                         # = folder name
title: Data Observability        # shown in the panel header
nav_label: Observability         # short name for "Related pages"
section: Govern                  # menu group (TH: ค้นหาข้อมูล / ธรรมาภิบาล / ผู้ดูแลระบบ)
routes: [/observability]         # react-router patterns this page covers; [] = not tied to a route
roles_full: [steward, owner, custodian, admin]   # role ids from src/auth/permissions.ts
roles_view: [consumer, council, auditor]
keywords: [incident, MTTD, ...]  # extra retrieval terms; put Thai synonyms in th/ files
related: [alerts, quality]       # page_ids shown as "Related pages"
prd: OBS                         # PRD reference (optional)
summary: One sentence shown at the top of the panel.
last_updated: 2026-10-24
version: 1.0.0
---

## What is this page {#what}
...
```

Frontmatter is a flat YAML subset: `key: value` or `key: [a, b, c]`. Do not use nested YAML.

Every page has these H2 sections, in this order. The `{#anchor}` is the same in both languages:

| anchor | EN heading | TH heading |
| --- | --- | --- |
| `what` | What is this page | หน้านี้คืออะไร |
| `purpose` | Purpose & goals | วัตถุประสงค์และเป้าหมาย |
| `who` | Who uses it | ใครใช้หน้านี้ |
| `how` | How to use | วิธีใช้งาน |
| `fields` | Key fields & metrics | ฟิลด์และตัวชี้วัดสำคัญ |
| `tasks` | Common tasks | งานที่ทำบ่อย |
| `tips` | Tips & FAQ | เคล็ดลับและคำถามที่พบบ่อย |

The body supports paragraphs, `- ` bullets, `1. ` numbered steps, `> ` tips, `**bold**`, `` `code` `` and `[label](/route)` links. Use the exact on-screen labels (button, tab and card names) so users and the Chat can match them to the UI.

The builder fails if any of these is true: a field or section is missing, an id or lang does not match the file path, a translation is missing, the anchors differ between languages, a `related` id is unknown, or a route in `src/main.tsx` has no help page.

## Adding a page

1. Add the route in `src/main.tsx`.
2. Copy an existing pair (`en/x.md`, `th/x.md`), then change `id`, `routes` and the text.
3. Run `npm run help:check`.

## Chunk record (`help-chunks.jsonl`, one JSON object per line)

One record per H2 section per language. 17 pages × 2 languages × 7 sections = 238 chunks.

```json
{
  "id": "observability.en.how",
  "page_id": "observability", "lang": "en",
  "route": "/observability", "routes": ["/observability"],
  "title": "Data Observability", "section": "Govern",
  "section_heading": "How to use",
  "url_anchor": "/observability#help-how",
  "roles": ["steward", "owner", "custodian", "admin", "consumer", "council", "auditor"],
  "keywords": ["incident", "MTTD", "..."],
  "context": "EDC1 › Govern › Data Observability › How to use",
  "text": "plain text for embedding",
  "markdown": "original markdown for display",
  "source_file": "help-content/en/observability.md",
  "version": "1.0.0", "last_updated": "2026-10-24"
}
```

## How Chat / RAG should use it

1. **Ingest**: load `help-chunks.jsonl` (or fetch `/help/help-chunks.jsonl`). Re-ingest when `version` or `last_updated` changes. `id` is stable, so you can upsert by it.
2. **Embed** `context + "\n" + text` (and optionally `keywords`) with the platform embedding model. Settings lists `bge-m3` (multilingual), which works for both Thai and English.
3. **Filter** at query time:
   - `lang` = the UI language (`en` or `th`). If nothing matches, fall back to the other language and answer in the UI language.
   - Boost chunks whose `routes` match the page the user is on. Ask Softnix already reads the current route (`useLocation`).
   - Optionally boost by role: `roles` contains the user's role id.
4. **Answer** from the retrieved chunks only. **Cite** the page `title` + `section_heading` and link to `url_anchor` (the route plus `#help-<anchor>`, which the Help panel uses as the section id).
5. Keep data questions ("where is customer revenue?") on the catalog search and metadata tools. Help chunks answer *how to use the system*.
