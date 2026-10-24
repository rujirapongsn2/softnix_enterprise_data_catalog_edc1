---
id: observability
lang: en
title: Data Observability
nav_label: Observability
section: Govern
routes: [/observability]
roles_full: [steward, owner, custodian, admin]
roles_view: [consumer, council, auditor]
keywords: [observability, incident, anomaly, MTTD, schema change, volume, distribution, freshness, pipeline, OpenLineage, dedup, acknowledge, alert, contract violation]
related: [alerts, quality, asset-detail, inbox]
prd: OBS
last_updated: 2026-10-24
version: 1.0.0
summary: Detect and triage data incidents such as schema, volume, distribution, freshness and pipeline failures, with alert dedup.
---

## What is this page {#what}

**Data Observability** shows incidents detected on your data: volume, schema and distribution anomalies, contract checks and pipeline health from OpenLineage RunEvents. Alerts are routed to the Owner or Steward, with duplicates grouped together.

## Purpose & goals {#purpose}

- Detect data problems before consumers notice them (low MTTD).
- Cut alert noise by grouping duplicate alerts into one incident.
- Make sure each incident has an owner and becomes a tracked data issue.

## Who uses it {#who}

Stewards, Owners, Custodians (data engineers) and Platform Admins acknowledge incidents. Consumers, the Council and Auditors can view.

## How to use {#how}

1. Read the cards: **Open incidents**, **MTTD · 30 d**, **Alerts deduplicated** and **Pipeline success · 24 h**.
2. In the **Incident timeline**, filter by type: All, Schema, Volume, Distribution, Pipeline, Freshness.
3. For each incident, check the time and ID, severity, type, state, title, affected asset, **Routed to**, **Grouped** (how many alerts were merged) and **Detected**.
4. Click **Acknowledge** on an Open incident to take ownership. EDC creates a Data Issue.
5. Use the side charts (Volume · WEB_EVENTS, Freshness · billing_monthly, Pipeline health) to confirm the pattern.
6. Click **Alert settings** to change who gets notified.

## Key fields & metrics {#fields}

- **MTTD**: mean time to detect over 30 days (target ≤ 30 min).
- **Alerts deduplicated**: for example 142 → 16 means 89% of the noise was removed.
- **Pipeline success · 24 h**: successful runs out of all runs.
- **Severity**: Critical, High, Medium, Low. **State**: Open, Acknowledged, Resolved, Muted (inside a maintenance window).
- **3σ band**: the volume chart warns when a point falls outside the expected range.
- **PSI**: a distribution-drift measure. Above 0.25 means a significant shift.

## Common tasks {#tasks}

- Triage the Critical and High Open incidents first (for example a pipeline FAIL or a breaking schema change against a contract).
- Check the contract on the asset's **Contract** tab when a Schema incident appears.
- Check pipeline p95 duration and the last run in **Pipeline health**.

## Tips & FAQ {#tips}

- Muted incidents happened during a maintenance window. Manage the windows in **Alert Settings**.
- If an incident has not been acknowledged within 4 hours, it escalates from the Steward to the Owner.
