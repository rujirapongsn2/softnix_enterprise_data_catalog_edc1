---
id: privacy
lang: en
title: Privacy & PDPA
nav_label: Privacy & PDPA
section: Govern
routes: [/privacy]
roles_full: [steward, dpo]
roles_view: [owner, custodian, council, auditor]
keywords: [privacy, PDPA, PII, personal data, sensitive data, s.26, RoPA, classification, scan, review queue, inventory, masking, DPO]
related: [asset-detail, access, inbox, settings]
prd: CLS-02–06, AI-03
last_updated: 2026-10-24
version: 1.0.0
summary: Discover personal data, confirm it as a steward, and prepare RoPA evidence for PDPA.
---

## What is this page {#what}

**Privacy & PDPA** is where personal data found in the Lakehouse and source systems is reviewed and tracked. Auto-classification (rules, regex, ML and LLM) suggests which columns hold personal data. A steward confirms each suggestion, and the confirmed tags are synced to the Lakehouse for masking and access control.

## Purpose & goals {#purpose}

- Know where personal and sensitive data (PDPA s.26) lives.
- Make sure nothing is tagged or masked until a human steward confirms it.
- Produce the Record of Processing Activities (RoPA) input for PDPA s.39.

## Who uses it {#who}

- **Data Steward** and **DPO**: confirm or reject suggestions. The DPO exports RoPA input.
- **Owner, Custodian, Council, Auditor**: view only.

## How to use {#how}

1. Check the four cards: Columns scanned, PII confirmed by steward, Datasets with personal data (and how many are sensitive under s.26), and Policy sync to Lakehouse.
2. Open the **Review queue** tab. Use **Confidence ≥ 90%** or **Sensitive only** to focus.
3. For each row, read the Column, Detected as, Confidence, Method, Evidence, Masked sample and Proposed class. Then click ✓ (accept) or ✕ (reject).
4. To decide in bulk, tick several rows and click **Accept** or **Reject**.
5. Open **PII inventory** to see column counts by PII type, and **Processing records** for the RoPA table.

## Key fields & metrics {#fields}

- **Confidence**: green ≥ 90%, amber ≥ 75%.
- **Method**: Rule, Regex, ML or **LLM**.
- **Masked sample**: example values, masked, so you can judge without seeing real data.
- **Proposed class**: the classification the column will receive (for example Restricted).
- **Policy sync to Lakehouse**: share of tags already applied in the Lakehouse. Tags out of sync are reconciled at 02:00.
- **Processing records**: Dataset, Purpose, Legal basis, Data subjects, Categories, Retention and Complete %.

## Common tasks {#tasks}

- **Run scan** (Steward, Custodian, DPO, Admin): queue a new auto-classification run.
- **Export RoPA input** (DPO, Auditor): download the RoPA table as xlsx in Thai.
- Confirm sensitive columns such as `blood_group` (health data, s.26). These need DPO sign-off.

## Tips & FAQ {#tips}

- Accepted tags are queued for Lakehouse sync. Rejected suggestions will not be suggested again.
- **Privacy guard for AI**: sample data is not sent to the LLM, PII is masked first, and Restricted assets use the on-prem model only.
- Fill RoPA rows below 100% (for example WEB_EVENTS at 40%) before an audit.
