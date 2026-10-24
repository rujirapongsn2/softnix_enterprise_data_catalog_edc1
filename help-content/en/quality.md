---
id: quality
lang: en
title: Data Quality
nav_label: Data Quality
section: Govern
routes: [/quality]
roles_full: [steward, owner, custodian]
roles_view: [consumer, dpo, council, auditor, admin]
keywords: [data quality, DQ, rule, score, Great Expectations, GX, dimension, threshold, freshness, data issue, CDE]
related: [asset-detail, observability, inbox, dashboard]
prd: DQ
last_updated: 2026-10-24
version: 1.0.0
summary: Overview of data quality rules, scores and open data issues across datasets.
---

## What is this page {#what}

**Data Quality** gives an overview of quality across the catalog. Rules are defined here and run by the Lakehouse DQ engine (Great Expectations + PySpark). Results flow back to EDC through the API or OpenLineage.

## Purpose & goals {#purpose}

- Find the datasets with the lowest scores and fix them first.
- Make sure critical data has rules and that rule failures become tracked data issues.

## Who uses it {#who}

Stewards, Owners and Custodians create and import rules. Other roles can view.

## How to use {#how}

1. Read the summary cards: **Avg score · Critical**, **Rules** (including AI-suggested rules awaiting review), **Failing rules** and **Freshness SLA breaches**.
2. In **Datasets by score (lowest first)**, check Score, Trend, Freshness and Open issues.
3. Click a dataset to open its **Data Quality** tab, which shows rule-level detail.
4. Follow up items in **Open data issues** (status: Assigned, Root cause, Corrective action, Closed).

## Key fields & metrics {#fields}

- **Score colours**: green ≥ 95%, amber ≥ 85%, red below 85%.
- **Dimensions**: Accuracy, Completeness, Validity, Consistency, Uniqueness, Timeliness.
- **Rule**: column, dimension, GX expectation, severity, threshold and score. A score below its threshold is a failure.
- **Freshness SLA breach**: data later than allowed. EDC creates a Data Issue automatically.

## Common tasks {#tasks}

- **New rule**: choose the dataset, column, dimension, expectation, severity, threshold and what happens on fail. New rules wait for their first GX run.
- **Import GX suites**: upload a Great Expectations suite (.json).
- Review AI-suggested rules on an asset's Data Quality tab and click **Add to suite**.

## Tips & FAQ {#tips}

- Rules on CDE columns count double in the DQ score.
- A certified asset is decertified automatically after 3 consecutive runs below threshold.
- For live anomalies (volume, schema, pipeline failures) use **Observability**.
