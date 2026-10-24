---
id: glossary
lang: en
title: Business Glossary
nav_label: Business Glossary
section: Discover
routes: [/glossary, /glossary/:id]
roles_full: [steward, owner, council]
roles_view: [consumer, custodian, dpo, auditor, admin]
keywords: [glossary, business term, definition, KPI, formula, synonym, steward, ISO 11179, draft, candidate, approved, retired, change request]
related: [asset-detail, inbox, search, domains]
prd: GLO, WF-02
last_updated: 2026-10-24
version: 1.0.0
summary: Agreed bilingual business definitions, KPI formulas and their links to data assets.
---

## What is this page {#what}

The **Business Glossary** holds the organisation's agreed business terms in Thai and English, for example "Active Customer" or "Churn". The left tree groups terms by domain. The right side shows the selected term's definition, calculation (for KPIs), properties, linked assets and relationships.

## Purpose & goals {#purpose}

- Give everyone one meaning for each business word, so reports and analyses agree.
- Link terms to the actual columns and reports that implement them.
- Control changes to definitions through an approval workflow (ISO/IEC 11179 registration status).

## Who uses it {#who}

- **Data Steward / Owner / Governance Council**: create, maintain and approve terms.
- **All other roles**: read terms and **Propose change**.

## How to use {#how}

1. Filter or browse the tree on the left. Click a term to open it.
2. Read the **Definition** and, for KPIs, the **Calculation**.
3. Check **Properties**: Domain, Steward, Synonyms, Abbreviation and Status.
4. Check **Linked assets** to see which tables and columns use the term. AI-suggested links can be accepted with **Link**.
5. Use **Relationships** (Broader, Narrower, Related) to explore similar terms. "Impact if changed" shows how many assets, reports and DQ rules depend on the term.
6. Want a different definition? Click **Propose change**. It becomes a change request in **My Tasks** (Steward → Owner).

## Key fields & metrics {#fields}

- **Status stepper**: Draft → Candidate → Approved → Retired. Only Approved terms are official.
- **KPI badge**: the term is a measured indicator with a formula.
- **Synonyms**: other words people use (for example "Attrition" for Churn). Search matches synonyms too.
- A yellow banner shows an open change request (for example CR-0311 on "Active Customer").

## Common tasks {#tasks}

- **New term** (Steward, Owner, Council): enter the definition, domain, steward and synonyms. Save it as Draft or submit it as Candidate.
- **Approve** a Candidate term (Owner, Council).
- **Import Excel** (Steward, Council): template columns are Term EN, Term TH, Definition, Domain, Steward and Synonyms.
- **Find duplicates**: AI checks for duplicate or conflicting terms.
- **Suggest columns**: AI suggests columns to link.

## Tips & FAQ {#tips}

- Check "Impact if changed" before you propose a definition change. Downstream KPIs may move.
- Terms are bilingual. Searching in Thai finds English terms and the other way round.
- Glossary links on an asset's Overview tab open the term here.
