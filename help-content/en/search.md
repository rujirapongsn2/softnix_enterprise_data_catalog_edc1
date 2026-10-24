---
id: search
lang: en
title: Search
nav_label: Search
section: Discover
routes: [/search]
roles_full: [consumer, steward, owner, custodian, dpo, council, auditor, admin]
roles_view: []
keywords: [search, find data, filter, facet, certified, classification, PII, domain, layer, saved search, export, Thai search]
related: [asset-detail, glossary, domains, home]
prd: SRC-01–04, AI-01
last_updated: 2026-10-24
version: 1.0.0
summary: Find tables, columns, reports and glossary terms in Thai or English, then narrow the results with filters.
---

## What is this page {#what}

**Search** lists every catalogued asset (tables, views, reports, models and more) that matches your words. You can search by name, description, column, glossary term or tag, in Thai or English. Filters on the left narrow the results.

## Purpose & goals {#purpose}

- Find the right dataset quickly and pick the trusted version.
- Compare candidates by certification, owner, classification, data quality and freshness before you use them.

## Who uses it {#who}

All roles. Data Consumers and analysts use it most. Stewards use it to find gaps, such as assets missing an owner.

## How to use {#how}

1. Type in the search box and press **Enter**. Thai words are segmented automatically.
2. Narrow results with **Filters**: Asset type, Domain, Certification, Classification, Personal data (PDPA), Layer and Source system. The number next to each value shows how many results it has.
3. Use **Quick filters**: **Missing owner** or **Fresh (within SLA)**.
4. Change **Sort**: Relevance (certified and popular first), Rating or Data quality. Switch between list and grid view.
5. Click a result card to open the asset page.
6. Not sure what to type? Click **Ask in natural language** to ask Ask Softnix.

## Key fields & metrics {#fields}

Each result card shows:

- **Business name** and technical name, with the full path (for example `lakehouse.gold.customer_360`).
- Badges: **Certified**, **Authoritative**, **Critical**, **PII / Sensitive** and **AI draft metadata**.
- **Domain**, **Owner** (red "Unassigned" if missing), **Classification**, **DQ %**, **Updated** (red if outside the freshness SLA) and **rating**.
- The AI hint above the results suggests a matching glossary term and the authoritative source. It also tells you how many restricted assets are hidden by your permissions.

## Common tasks {#tasks}

- **Save search**: keep a query and its filters in "My saved searches".
- **Export**: download the result list to Excel.
- Remove a filter by clicking × on its chip, or click **Clear all**.

## Tips & FAQ {#tips}

- **Why don't I see a table I know exists?** It may be Restricted and hidden by your permissions. Ask the Owner or request access.
- Prefer assets that are **Certified** and **Authoritative**. They have an owner, a description and confirmed classification.
- "No description yet — Steward action needed" means the asset is not yet documented.
