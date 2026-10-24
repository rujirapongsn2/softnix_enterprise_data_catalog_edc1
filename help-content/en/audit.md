---
id: audit
lang: en
title: Audit Trail
nav_label: Audit Trail
section: Administration
routes: [/audit]
roles_full: [auditor, admin]
roles_view: [steward, owner, custodian, dpo, council]
keywords: [audit, audit trail, log, hash chain, approval history, AI-assisted, MCP, export, compliance, evidence]
related: [access, settings, roles, inbox]
prd: AUD, ASK-12, MCP-05
last_updated: 2026-10-24
version: 1.0.0
summary: An append-only, tamper-evident log of every metadata change, approval, AI action and MCP call.
---

## What is this page {#what}

The **Audit Trail** is an append-only, hash-chained log of metadata changes, approvals, AI actions and MCP tool calls. Entries are kept for 5 years. The **Chain verified** badge confirms that no entry has been altered.

## Purpose & goals {#purpose}

- Show who changed what, when, from what value to what value, and through which channel.
- Provide evidence for internal audit, PDPA and regulators.

## Who uses it {#who}

Auditors and Platform Admins (full access, including export). The DPO can export too. Stewards, Owners, Custodians and the Council can view.

## How to use {#how}

1. Filter by user, asset or action in the text box.
2. Choose an action type: All actions, Approvals, Classification changes, AI-assisted, MCP calls. Choose a period: Last 7 or 30 days.
3. Read each row: Time, Actor, Action, Target, Old → New, Channel and Hash.
4. Click **Export for auditor** to get a signed export (CSV + hash manifest).

## Key fields & metrics {#fields}

- **Channel**: UI (manual), **AI** (an AI-assisted change confirmed by a user) or **MCP** (a call from an external AI client such as claude-desktop).
- **Hash**: the link in the chain. A broken chain would show that an entry was tampered with.

## Common tasks {#tasks}

- Prove who approved an access request, and when.
- List all AI-assisted metadata changes for a period.

## Tips & FAQ {#tips}

- Each asset also has its own history on its **History** tab.
- Nothing can be deleted from the trail. Corrections appear as new entries.
