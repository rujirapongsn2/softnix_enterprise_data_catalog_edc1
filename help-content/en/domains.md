---
id: domains
lang: en
title: Domains & Data Products
nav_label: Domains & Products
section: Discover
routes: [/domains]
roles_full: [steward, owner, custodian, council]
roles_view: [consumer, dpo, auditor, admin]
keywords: [domain, data product, SLA, SLO, error budget, consumers, owner, critical completeness, data mesh]
related: [asset-detail, search, dashboard, quality]
prd: CAT-09
last_updated: 2026-10-24
version: 1.0.0
summary: Business domains and the data products they publish, each with an owner, SLA/SLO and usage.
---

## What is this page {#what}

**Domains & Data Products** groups assets by business domain (Customer, Finance, Sales, HR, Marketing, Operations). It also lists **data products**: curated bundles of assets with an owner, an SLA, a usage guide and SLO tracking (for example Customer 360 or Monthly Revenue Mart).

## Purpose & goals {#purpose}

- Show who is accountable for each area of data.
- Let consumers pick ready-to-use, supported data products instead of raw tables.
- Make service levels visible (SLA, SLO attainment, error budget).

## Who uses it {#who}

Owners and Stewards publish and maintain products. Custodians run them. Consumers browse and choose products. Other roles can view.

## How to use {#how}

1. Browse the **Data products** cards. Each shows the domain, description, SLA, SLO badges, number of assets and consumers, rating and owner.
2. Click **Open** to go to the product's main asset.
3. Scroll to **Domains**. Click a domain card to search all of its assets.
4. Owners and Stewards: click **New data product** to create one (it starts as Draft).

## Key fields & metrics {#fields}

- **SLA**: the promised delivery (for example "Daily by 06:00 · 99.5%").
- **SLO badges**: Freshness, Completeness, Volume, DQ and Availability, each with 30-day attainment. ✓ means met and ✕ means breached.
- **Error budget**: how much of the allowed failure is left this period. 0% means the budget is used up.
- **Shield icon**: the product is certified.
- Domain card: **assets**, **certified**, **products**, **Critical completeness** % and the **Domain owner**.

## Common tasks {#tasks}

- Choose a product for analysis: prefer certified products with SLOs met and budget left.
- Spot domains with low critical completeness and follow up with the domain owner.

## Tips & FAQ {#tips}

- A product whose error budget is used up (for example Digital Engagement at 0%) should be reviewed before new consumers rely on it.
- Hover an SLO badge to see its target and 30-day attainment.
