---
id: alerts
lang: en
title: Alert Settings
nav_label: Alert Settings
section: Govern
routes: [/alerts]
roles_full: [steward, owner, custodian, admin]
roles_view: [auditor]
keywords: [alert, routing rule, notification, channel, severity, dedup, grouping, maintenance window, mute, escalation, on-call]
related: [observability, quality, inbox]
prd: OBS-04
last_updated: 2026-10-24
version: 1.0.0
summary: Decide who is notified, on which channel, at what severity and with what dedup, and mute alerts during maintenance.
---

## What is this page {#what}

**Alert Settings** controls how observability and quality alerts reach people: routing rules, channels, severity, dedup / grouping, maintenance windows and escalation.

## Purpose & goals {#purpose}

- Send each alert to the right person on the right channel.
- Avoid alert fatigue with dedup windows, digests and maintenance muting.
- Make sure nothing is missed, with escalation and on-call cover.

## Who uses it {#who}

Stewards, Owners, Custodians and Admins manage rules. Only Custodians and Admins can add maintenance windows. Auditors can view.

## How to use {#how}

1. Review **Routing rules**: ID, Scope, Trigger, Severity, Route to, Channels, Dedup / grouping and Enabled.
2. Turn a rule on or off with the **Enabled** checkbox.
3. Click **New alert rule** to add one (scope, trigger, severity, route, channel, dedup).
4. Under **Maintenance windows (mute)**, click **Add** to mute alerts for a scope during planned work.
5. Check **Escalation & on-call** for the default route, this week's on-call person and the severity-to-channel map.

## Key fields & metrics {#fields}

- **Trigger**: for example contract violation (breaking), pipeline run FAIL, DQ score below threshold, volume anomaly (> 3σ), distribution drift (PSI > 0.25).
- **Dedup / grouping**: for example "1 per asset / 6 h", or Digest.
- **Severity map**: Critical → page · High → chat + email · Medium → email · Low → daily digest.
- **Auto Data Issue**: High and Critical alerts create a Data Issue automatically (DQ-05).

## Common tasks {#tasks}

- Route a new domain's contract violations to its Steward with escalation to the Owner.
- Mute alerts during an ERP upgrade with a maintenance window.

## Tips & FAQ {#tips}

- Default route: Steward of the asset, then the Owner if not acknowledged within 4 hours.
- Use digests for Medium and Low alerts to keep channels quiet.
