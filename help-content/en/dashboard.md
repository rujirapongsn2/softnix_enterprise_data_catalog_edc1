---
id: dashboard
lang: en
title: Governance Dashboard
nav_label: Governance Dashboard
section: Govern
routes: [/dashboard]
roles_full: [council]
roles_view: [steward, owner, custodian, dpo, auditor, admin]
keywords: [governance dashboard, KPI, coverage, adoption, quality, MTTD, MTTR, SLO, backlog, target, domain, report, export]
related: [home, domains, quality, observability]
prd: AUD-02, §2.3
last_updated: 2026-10-24
version: 1.0.0
summary: Governance success and quality metrics against targets, by domain, for steering and reporting.
---

## What is this page {#what}

The **Governance Dashboard** tracks the success and quality metrics from PRD §2.3 against their targets for six months after go-live. It has two tabs: **Coverage & adoption** and **Quality**.

## Purpose & goals {#purpose}

- Show the Governance Council and domain owners where the programme is on or off track.
- Prioritise the backlog: owners, PII confirmation, terms, issues and SLAs.

## Who uses it {#who}

The Data Governance Council uses it most and can export reports. Owners, the DPO and Auditors can also export. Others can view.

## How to use {#how}

1. Pick a domain in the **All domains** selector to focus.
2. **Coverage & adoption**: read the metric cards (Harvest coverage, Ownership · Critical, Documentation · Critical, PII confirmed, Lineage · Critical, Monthly active users), **Coverage by domain**, **Backlog**, **Access request lead time** and **Top stewards this month**.
3. **Quality** tab: read DQ rule coverage · CDE, Data products meeting SLO, MTTD, MTTR, Issues with root cause and Contract violations (30 d), plus the **Monthly domain quality review (PDCA)** table.
4. Click **Export PDF (TH)** to share the report.

## Key fields & metrics {#fields}

- **On track / pts to go**: whether the metric has reached its target.
- **Critical-asset completeness**: share of critical assets with full metadata, by domain.
- **MTTD / MTTR**: mean time to detect (minutes) and to resolve (days) data incidents. Lower is better.
- **Access request lead time**: average business days to grant access (target ≤ 2).
- **Backlog**: for example critical assets without an owner, PII suggestions to confirm, workflow tasks past SLA.

## Common tasks {#tasks}

- Prepare the monthly council meeting: export the PDF and review domains that are off target.
- Assign owners to critical assets that have none.

## Tips & FAQ {#tips}

- Low consumer ratings (≤ 2★) and repeated issues feed proposals for new DQ rules or contract changes.
- The Home page shows a short version of these KPIs.
