---
id: asset-detail
lang: en
title: Asset detail
nav_label: Asset detail
section: Discover
routes: [/asset/:id]
roles_full: [consumer, steward, owner, custodian, dpo, council, admin]
roles_view: [auditor]
keywords: [asset, table, dataset, columns, lineage, impact, contract, data quality, access, request access, report issue, follow, discussion, certification, profiling]
related: [search, glossary, quality, observability, inbox, privacy]
prd: CAT, CLS, LIN, CTR, DQ, ACC, AUD
last_updated: 2026-10-24
version: 1.0.0
summary: Everything about one dataset or report, including meaning, columns, lineage, contract, quality, access and history.
---

## What is this page {#what}

The **Asset detail** page shows everything EDC knows about one asset (for example `lakehouse.gold.customer_360`). The header shows the business name, badges (Certified, Authoritative source, Critical, PII), path, type, domain and classification, plus **Rating**, **Data quality**, **Freshness** and **Rows**. Tabs below the header show the detail.

## Purpose & goals {#purpose}

- Decide whether the data is right for your use and whether you can trust it.
- Know who to ask (Owner, Steward, Custodian, DPO) and what you may do with the data.
- See what is affected upstream and downstream before you change anything.

## Who uses it {#who}

Everyone who works with data. Consumers read it and request access. Stewards and Owners edit business metadata and certify assets. Custodians check lineage and contracts. Auditors have read-only access.

## How to use {#how}

1. **Overview**: read the description, linked glossary terms and tags, business attributes (purpose, update frequency, freshness SLA, retention, legal basis), technical metadata, stakeholders, the DQ summary and **Certification readiness**.
2. **Columns**: filter by All, PII, CDE or Undocumented. Click a column to open its drawer with type, glossary term, classification, PII state and profile (null % / distinct %).
3. **Lineage**: see upstream sources and downstream consumers. Use it for impact analysis.
4. **Contract**: compare the expected schema in the data contract (ODCS) with the actual harvested schema. Breaking changes are highlighted in red, and you can see the SLA/SLO status and the consumers affected.
5. **Data Quality**: see scores by dimension, the score trend, rules and AI-suggested rules.
6. **Access**: see who has access, which columns are masked, your own access and the policies applied.
7. **History**: see the audit trail and schema versions.

## Key fields & metrics {#fields}

- **Certification readiness**: Owner assigned, Steward assigned, Description, Classification, Glossary terms linked, PII confirmed. Critical assets must pass all of them before an Owner can certify (CDMC C2).
- **CDE**: Critical Data Element, a column with stricter quality rules.
- **PII badge with "?"**: suggested by auto-classification and waiting for steward confirmation.
- **Contract status**: Compliant or **Violated**. Breaking changes quarantine Gold publishing.
- **Freshness SLA**: how old the data may be (for example ≤ 26 hours).

## Common tasks {#tasks}

- **Request access**: give the purpose (required), privilege, duration (30/90/180 days) and columns. Selecting PII columns adds a DPO step: Submit → Data Owner → DPO (PII) → Grant in Lakehouse.
- **Report issue**: give a title, quality dimension, severity and details. The issue goes to the Steward automatically.
- **Follow**: get notified of changes. **Discussion**: ask questions, rate the asset or reply.
- **Explain with AI**: ask Ask Softnix to explain the table in business terms.
- Stewards: **Edit** or **Regenerate** the description, accept or reject AI drafts, and confirm or reject suggested PII.
- **Open in SQL editor**: open the table in the Lakehouse (Trino).

## Tips & FAQ {#tips}

- **"You can see metadata but not query data"** means you need to request access first.
- Unselected PII columns stay masked even after your request is approved.
- Access is time-bound. The grant is revoked automatically when it expires.
- AI-assisted changes are logged in the audit trail as AI-assisted.
