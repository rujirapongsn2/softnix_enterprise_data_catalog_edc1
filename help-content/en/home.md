---
id: home
lang: en
title: Home
nav_label: Home
section: Discover
routes: [/]
roles_full: [consumer, steward, owner, custodian, dpo, council, auditor, admin]
roles_view: []
keywords: [home, dashboard, my tasks, following, AI curation, popular certified data, harvest health, KPI, coverage]
related: [search, inbox, privacy, sources, glossary]
prd: AUD-02, WF-04, SRC-05
last_updated: 2026-10-24
version: 1.0.0
summary: Your personal start page with governance KPIs, your tasks, assets you follow, AI suggestions and harvest health.
---

## What is this page {#what}

**Home** is your starting point in EDC1. The banner greets you with your current role and shows your open and overdue tasks. Below it are the key governance KPIs and cards for the work and data that matter to you.

## Purpose & goals {#purpose}

- See what needs your attention today without opening several pages.
- Track progress against governance targets (ownership, documentation, PII and lineage coverage).
- Jump quickly to popular, certified data that others already trust.

## Who uses it {#who}

All roles. Each person's tasks and greeting depend on the role selected in the top bar.

## How to use {#how}

1. Read the banner: it shows your role and how many tasks are open or overdue.
2. Click a **domain chip** (Customer, Finance, Sales, HR, Marketing, Operations) to search within that domain.
3. Use **Ask a data question** to ask Ask Softnix in plain language, or **Browse catalog** to open Search.
4. Check the four **KPI cards**. A green "▲ on target" means the target is met. Amber "▼ target …%" means there is still work to do.
5. Open a task from **My tasks**, or a dataset from **Following** or **Popular certified data**.

## Key fields & metrics {#fields}

- **Ownership coverage · Critical**: share of critical assets with an assigned Owner (target 95%).
- **Documentation coverage · Critical**: share of critical assets with a business description (target 80%).
- **PII confirmed by steward**: share of detected PII that a steward has confirmed (target 90%).
- **Lineage coverage · Critical**: share of critical assets with lineage (target 90%).
- **Following**: changes on assets you follow, such as schema changes, freshness SLA breaches, new comments or certification requests.
- **AI curation**: AI suggestions waiting for review (descriptions, PII / classification, glossary links, DQ rules) and the 30-day acceptance rate.
- **Popular certified data**: certified assets ranked by queries in the last 30 days.
- **Harvest health**: status of each source connector (green = healthy, amber = warning, red = failed).

## Common tasks {#tasks}

- Clear overdue tasks first: click a red **Overdue** item in My tasks.
- Review AI suggestions: click **Review** on the AI curation card.
- Check a failed source: click **Sources** on Harvest health.
- See new or candidate glossary terms: **New in glossary**.

## Tips & FAQ {#tips}

- Click **Follow** on any asset page to see its changes here.
- KPI targets come from PRD §2.3. The full breakdown by domain is on the **Governance Dashboard**.
- The task count in the banner matches the badge on **My Tasks** in the left menu.
