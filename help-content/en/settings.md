---
id: settings
lang: en
title: Settings
nav_label: Settings
section: Administration
routes: [/settings]
roles_full: [admin]
roles_view: [custodian, auditor]
keywords: [settings, AI provider, model, guardrails, Ask Softnix, MCP server, metamodel, custom attribute, language, calendar, identity provider, Keycloak]
related: [roles, audit, sources, privacy]
prd: AI-09/10, MCP, CAT-03
last_updated: 2026-10-24
version: 1.0.0
summary: Platform configuration for AI models and guardrails, the MCP server, the metamodel and general options, without redeploying.
---

## What is this page {#what}

**Settings** configures EDC without redeploying it. It has four tabs: **AI & Ask Softnix**, **MCP server**, **Metamodel** and **General**.

## Purpose & goals {#purpose}

- Control which AI models are used and how data is protected when AI is used.
- Let external AI tools use the catalog safely through MCP.
- Extend the metadata captured for each asset type.

## Who uses it {#who}

Only the **Platform Admin** can change settings. Custodians and Auditors can view.

## How to use {#how}

1. **AI & Ask Softnix**: see the **Model providers** for each feature (all hosted on-prem) and set the **Guardrails**: sending sample data to the LLM, masking PII before sending, on-prem only for Restricted assets, action mode (save with confirmation), voice, chat history. The token quota is shown below.
2. **MCP server**: see the endpoint, transport, auth (OAuth 2.1 via Keycloak), write tools (proposals only), rate limit, allowed clients and available tools.
3. **Metamodel**: list the custom attributes by asset type. Click **New attribute** to add one.
4. **General**: default language, calendar (ค.ศ. / พ.ศ.), identity provider and tenants.

## Key fields & metrics {#fields}

- **Guardrails** decide what AI can see and do. Defaults: no sample data sent, PII masked, Restricted on-prem only.
- **Write tools: Proposals only → workflow**: MCP clients cannot change metadata directly. Their changes become tasks.
- **Required** on an attribute: for example Critical, Yes, or "If PII".

## Common tasks {#tasks}

- Add a "Cost center" style attribute for data products.
- Allow a new MCP client after a security review.

## Tips & FAQ {#tips}

- Every settings change is recorded in the **Audit Trail**.
- Locked checkboxes mean your role can only view settings.
