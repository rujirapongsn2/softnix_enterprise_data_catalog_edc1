---
id: getting-started
lang: en
title: Getting started with EDC1
nav_label: Getting started
section: General
routes: []
roles_full: [consumer, steward, owner, custodian, dpo, council, auditor, admin]
roles_view: []
keywords: [overview, navigation, menu, role, language, Thai, English, Ask Softnix, search, shortcut, help]
related: [home, search, roles]
prd: §3
last_updated: 2026-10-24
version: 1.0.0
summary: How the Enterprise Data Catalog is organised, how roles change what you see, and where to get help.
---

## What is this page {#what}

Softnix Enterprise Data Catalog (EDC1) is the single place to **find, understand, trust and govern** the organisation's data. It holds metadata only (names, descriptions, owners, classification, lineage, quality results). The data itself stays in the Lakehouse and source systems.

## Purpose & goals {#purpose}

- Help anyone find the right, trusted dataset quickly, in Thai or English.
- Make clear who owns and looks after each dataset, and how sensitive it is under PDPA.
- Give stewards, owners, the DPO and the Governance Council one workflow for approvals, quality and policy.

## Who uses it {#who}

Every role in PRD §3: Data Consumer, Data Steward, Data Owner, Data Custodian / Engineer, DPO / Privacy Officer, Data Governance Council, Auditor and Platform Admin. Menus, pages and buttons follow your role. Locked buttons show which role can use them when you hover over them.

## How to use {#how}

1. Use the **left menu**. **Discover** covers finding data (Home, Search, Business Glossary, Domains & Products). **Govern** covers stewardship work (My Tasks, Privacy & PDPA, Data Quality, Observability, Alert Settings, Policies & Access, Governance Dashboard). **Administration** covers platform setup (Sources & Harvest, Audit Trail, Settings, Roles & Permissions).
2. Use the **search box** in the top bar (`⌘/Ctrl + K`) to jump to a table, column, report or glossary term.
3. Switch language with **EN / ไทย** in the top bar. Help text follows the same setting.
4. Click the **? (Help)** icon on any page to open this guide for the page you are on.
5. Click **Ask Softnix** (bottom right, `⌘/Ctrl + J`) to ask questions in plain language.

## Key fields & metrics {#fields}

- **Certified**: the Data Owner has approved the asset as fit for use. Certified assets rank first in search.
- **Authoritative source**: the one asset to use for a subject (for example `gold.customer_360` for customers).
- **Classification**: Public, Internal, Confidential or Restricted (see Policies & Access).
- **PII / Sensitive (s.26)**: personal data under PDPA. Sensitive data needs DPO approval.
- **DQ score**: data quality score from the Lakehouse DQ engine.
- **Role badge** (top bar): the role you are currently using.

## Common tasks {#tasks}

- Find data → Search, then open the asset.
- Get access → open the asset and click **Request access**.
- Approve something → **My Tasks**.
- See how sensitive a dataset is → the asset's Classification and PII badges, or **Privacy & PDPA**.
- Try another role (demo) → avatar menu → **Switch role**.

## Tips & FAQ {#tips}

- **Why is a menu item missing?** Your role cannot see that page. See **Roles & Permissions**.
- **What does the "view" tag in the menu mean?** You can read the page but not change anything.
- **Is my data copied into EDC?** No. Connectors read metadata only, and profiling uses samples that are not stored.
