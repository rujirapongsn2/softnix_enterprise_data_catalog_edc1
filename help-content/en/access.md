---
id: access
lang: en
title: Policies & Access
nav_label: Policies & Access
section: Govern
routes: [/access]
roles_full: [steward, owner, dpo, council, admin]
roles_view: [consumer, custodian, auditor]
keywords: [policy, access, classification scheme, Public, Internal, Confidential, Restricted, access review, masking, retention, Lakehouse tag, grant]
related: [privacy, asset-detail, audit, roles]
prd: ACC, CLS-01
last_updated: 2026-10-24
version: 1.0.0
summary: The policy register, the data classification scheme and periodic access review campaigns.
---

## What is this page {#what}

**Policies & Access** holds the data policies, the four-level classification scheme and access review campaigns. EDC records the rules. The Lakehouse enforces them through tag and grant sync.

## Purpose & goals {#purpose}

- Keep one approved, versioned set of data policies.
- Apply the same classification levels everywhere.
- Review regularly who still needs access to sensitive data.

## Who uses it {#who}

- **DPO** and **Council**: draft policies. Only the **Council** approves policies and the classification scheme.
- **Owner, DPO, Council**: start access review campaigns.
- Other roles can view.

## How to use {#how}

1. **Policy register** tab: see each policy's Version, Status, Effective date, Applies to and Lakehouse enforcement. Candidate policies show an **Approve** button for the Council.
2. **Classification scheme** tab: read the definition of each level and its Lakehouse tag. The Council can **Propose change**.
3. **Access reviews** tab: track campaigns by Scope, Reviewer, Progress and Due date.
4. Use **New policy** or **New access review** at the top right to create one.

## Key fields & metrics {#fields}

- **Public (Level 1)**: freely shareable outside the organisation.
- **Internal (Level 2)**: default for business data, employees only.
- **Confidential (Level 3)**: business-sensitive or personal data, need-to-know.
- **Restricted (Level 4)**: national ID, financial accounts and PDPA s.26 data. Requires DPO approval.
- **Lakehouse enforcement**: for example tags `cls_*`, masking policy by tag, time-bound roles.

## Common tasks {#tasks}

- Approve POL-09 Data Retention (Candidate) as the Council.
- Start a quarterly review of Restricted data grants.

## Tips & FAQ {#tips}

- A new policy goes to the Data Governance Council for approval before it is enforced.
- To see the policies applied to one dataset, open its **Access** tab.
