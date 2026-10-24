# EDC1 ← Softnix Data Lakehouse CI spec

Source: product screenshots of the real platform UI from
https://www.softnix.co.th/products/softnix-data-lakehouse/ (assets/img/screenshots/*.png, 13 images,
the list comes from assets/js/i18n.js). Hex values were sampled with PIL from those PNGs (2026-10-24, Asia/Bangkok).

## Palette
| Role | Lakehouse (sampled) | EDC1 token |
|---|---|---|
| Primary (buttons, Active/Passed badge, avatar, user chat bubble, send) | #4582b8 (lineage #4584bd) | --primary #4582b8 |
| Primary hover | ~#3e75a6 | .btn.primary:hover |
| Primary disabled | #9fbed9 | locked / disabled send |
| Active nav item bg | #ecf4fa | --nav-active, --primary-50 |
| Icon tile bg | #ecf3f8 | .asset-icon/.mh-icon/.help-avatar |
| Selected list row | #e0eef7 | .tree-item.on/.role-opt.on |
| Sidebar | #ffffff + right border | --nav-bg |
| Page bg | #f9fafb | --bg |
| Top bar | #fafafb + bottom border | .topbar |
| Card | #ffffff, radius ~12px | --radius 12px |
| Stat tile / bot bubble | #f0f2f4 | --surface-3 |
| Code block / segmented tab track | #eef0f3 / #e2e5ea | .tabs/.seg/.lang-toggle |
| Input / divider border | #e2e5ea | --border |
| Card/table line (measured) | #b5bdca–#c4cad5 | --border-strong #d3d8e0 (lighter, see decisions) |
| Text | #101b2a | --text |
| Muted text | #566377 | --text-2 |
| Sidebar section label | #58606a, sentence case | .nav-section |
| Success / Healthy pill | #4fc660; pill #e2fbe8 / #33803f | --ok #3e9f4d, --ok-50 #e2fbe8 |
| Error | #e74341 (delete #dd524b) | --bad #e74341 |
| Dark chip / progress | #1e273a | --dark |

## Type
- Inter (UI) + Noto Sans Thai (Thai). The marketing site also loads Poppins, but the platform UI is Inter-like. Data cells/code use monospace (JetBrains Mono).
- Page title ~26–28px / 700, -0.02em; subtitle 14–15px muted; card title 15px / 600.

## Components
- Sidebar: white, ~248px, brand block (logo + product name), sentence-case groups, active = light-blue pill + blue icon, collapsible icon rail.
- Top bar: sidebar toggle at left, rounded search with ⌘K, right-side utilities, round blue avatar.
- Buttons: radius 6px, height 34px; primary is solid blue; secondary is white with a border.
- Tabs: segmented (grey track, white active pill); chips are radius 6px; filled dark chip when selected.
- Tables: light header (#f9fafb, muted 500 weight), sentence case, thin row rules, mono for technical names.
- AI assistant: white header, blue user bubble, light grey bot bubble, square-ish blue send button. Flat colours only, no gradients.
