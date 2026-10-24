---
id: sources
lang: en
title: Sources & Harvest
nav_label: Sources & Harvest
section: Administration
routes: [/sources]
roles_full: [custodian, admin]
roles_view: [steward, auditor]
keywords: [source, connector, harvest, metadata, Iceberg, Oracle, Snowflake, Power BI, OpenLineage, Trino, profiling, remote agent, schedule, test connection]
related: [home, privacy, asset-detail, settings]
prd: HRV
last_updated: 2026-10-24
version: 1.0.0
summary: Connect source systems and run metadata harvests on a schedule. No data is copied.
---

## What is this page {#what}

**Sources & Harvest** lists the connectors that read metadata from the Lakehouse, databases, cloud platforms, storage, BI tools, and APIs and files. Connectors read **metadata only**. Credentials are kept in the secret store, and the Lakehouse remains the system of record.

## Purpose & goals {#purpose}

- Keep the catalog complete and up to date automatically.
- Spot failed or partial harvests quickly so catalog information is not stale.

## Who uses it {#who}

Custodians / Data Engineers and Platform Admins add and run sources. Stewards and Auditors can view.

## How to use {#how}

1. Read the cards: Sources, Assets harvested, Schema changes (24h) and Failed sources.
2. Filter by group: All, Lakehouse, Databases, Cloud platforms, Storage, BI, API & files.
3. Click a row to open its detail: Connection, Credential (vault reference), Include / Exclude patterns, Profiling and Recent runs.
4. Click **Run** to harvest now, **Test connection** to check access, or **Configure** to edit.
5. Click **Add source** to start the 7-step wizard: Source type → Connection → Credentials & test → Scope → Schedule → Governance & PII → Review & create.

## Key fields & metrics {#fields}

- **Status**: Healthy, Warning, Failed, Running, Queued.
- **Last run**: when the last harvest ran and what happened (for example "3 tables skipped (permission)" or "ORA-12170 connect timeout").
- **Schedule**: for example every 1 h plus DDL events, daily 23:00, or push in real time.
- **lineage** badge: the source also sends lineage. **remote agent**: harvested through an on-prem agent.

## Common tasks {#tasks}

- Fix a failed source: read the error in Recent runs, run **Test connection**, and check the agent's egress.
- Add a new database and assign its domain, Owner and Steward, plus a PII scan, in the wizard.

## Tips & FAQ {#tips}

- Profiling samples rows (for example 100k) on a low-priority resource group and stores no values.
- **Remote agents** (top right) show which on-prem agents are online.
