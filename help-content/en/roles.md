---
id: roles
lang: en
title: Roles & Permissions
nav_label: Roles & Permissions
section: Administration
routes: [/roles]
roles_full: [admin]
roles_view: [consumer, steward, owner, custodian, dpo, council, auditor]
keywords: [roles, permissions, RBAC, ABAC, matrix, switch role, users, invite, IdP group, Keycloak, DAMA, reset demo data]
related: [getting-started, settings, audit, access]
prd: §3, NFR-01
last_updated: 2026-10-24
version: 1.0.0
summary: Which role can see and do what in EDC, plus users and identity-provider group mapping.
---

## What is this page {#what}

**Roles & Permissions** shows the access design from PRD v1.1 §3 (DAMA-DMBOK2 roles): RBAC with domain scope. A single matrix drives every menu, page and button in EDC1. It has three tabs: **Permission matrix**, **Roles** and **Users & groups**.

## Purpose & goals {#purpose}

- Make clear what each role can see and do.
- Manage users and map identity-provider groups to roles.

## Who uses it {#who}

All roles can view it. Only the **Platform Admin** can invite users and map groups.

## How to use {#how}

1. **Permission matrix**: show All, Pages or Actions. Each cell is full (use & change), view (read only) or none (hidden / locked). Your current role's column is highlighted. Click a role header to switch to that role.
2. **Roles**: one card per role with its duty, EDC rights, counts of full and view functions, and a demo persona. Use **Switch to this role**.
3. **Users & groups**: see users with their roles, domain scope, how they were assigned and their status. Use **Invite user**, and add **IdP group → role mapping**.
4. **Reset demo data** clears records created through the demo forms.

## Key fields & metrics {#fields}

- **Roles**: Data Consumer, Data Steward, Data Owner, Data Custodian / Engineer, DPO / Privacy Officer, Data Governance Council, Auditor, Platform Admin.
- **Domain scope**: Owner and Steward rights apply only within their assigned domains.
- **ABAC**: Restricted or PII data adds rules based on classification.

## Common tasks {#tasks}

- Check why someone cannot see a page: find the page row and the person's role column.
- Onboard a new steward: invite the user, or map their IdP group to Data Steward for a domain.

## Tips & FAQ {#tips}

- Sign-in uses OIDC via Keycloak. EDC stores no passwords.
- Your demo role choice is saved in this browser (`edc1.role`).
