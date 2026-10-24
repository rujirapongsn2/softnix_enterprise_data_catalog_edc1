---
id: inbox
lang: en
title: My Tasks
nav_label: My Tasks
section: Govern
routes: [/inbox]
roles_full: [consumer, steward, owner, custodian, dpo, council]
roles_view: [auditor, admin]
keywords: [tasks, inbox, approval, workflow, access request, change request, certification, PII review, data issue, glossary approval, SLA, overdue, escalation, delegate]
related: [asset-detail, glossary, privacy, quality, home]
prd: WF
last_updated: 2026-10-24
version: 1.0.0
summary: One inbox for approvals, reviews and issues assigned to you or your role, tracked against SLA.
---

## What is this page {#what}

**My Tasks** is your workflow inbox. It lists access requests, change requests, certifications, PII reviews, data issues and glossary approvals assigned to you or to your role. The list is on the left and the selected task's detail is on the right.

## Purpose & goals {#purpose}

- Make decisions on time. Every task has a due date (SLA) and escalates automatically when overdue.
- Give each decision context: requester, asset, workflow step and an AI summary.
- Keep a complete approval trail for audit.

## Who uses it {#who}

Stewards, Owners, Custodians, the DPO and the Council approve or reject tasks. Consumers see their own requests. Auditors and Admins see requests and history only.

## How to use {#how}

1. Switch the view at the top: **Assigned to me**, **My requests** or **Completed**.
2. Filter by type with the chips: Access Request, Change Request, Certification, PII Review, Data Issue, Glossary Approval.
3. Click a task. The detail shows the workflow stepper, Requested by, Created, Due, Asset, Details and the **AI summary**.
4. Decide: **Approve**, **Reject** (a comment is required), **Request info** or **Delegate**.

## Key fields & metrics {#fields}

- **Priority**: High, Medium or Low.
- **Overdue / SLA breached · escalated to Owner**: the due date has passed.
- **Stepper**: where the task is in its workflow. For example, an access request goes Submitted → Owner → DPO → Granted in Lakehouse, and a data issue goes Reported → Assigned → Root cause → Corrective action → Closed.
- **Change request diff**: the old definition (red) and the proposed one (green).
- **Certification gate**: checklist (Owner/Steward, completeness, naming, DQ ≥ threshold, CDE coverage, contract compliant, SLO, PII confirmed). Approval is disabled until every check passes.

## Common tasks {#tasks}

- Approve an access request for a set duration (for example AR-1042 for 90 days).
- Review a change request to a glossary definition (for example CR-0311 "Active Customer").
- Follow up a data issue such as DI-0207 (billing_monthly late).
- Confirm PII suggestions from a scan (for example PII-552).

## Tips & FAQ {#tips}

- **Why is Approve disabled for a certification?** The certification gate has failed checks, or certification needs the Data Owner (CAT-07).
- Read the AI summary first. It highlights risk, such as sensitive columns or downstream impact.
- Ask Softnix can summarise your pending approvals ("Which tasks are overdue?").
