---
id: observability
lang: th
title: การเฝ้าระวังข้อมูล (Data Observability)
nav_label: การเฝ้าระวังข้อมูล
section: ธรรมาภิบาล
routes: [/observability]
roles_full: [steward, owner, custodian, admin]
roles_view: [consumer, council, auditor]
keywords: [การเฝ้าระวังข้อมูล, observability, incident, เหตุผิดปกติ, ความผิดปกติ, MTTD, schema เปลี่ยน, ปริมาณข้อมูล, distribution, ความสดใหม่, pipeline, OpenLineage, dedup, acknowledge, แจ้งเตือน, contract]
related: [alerts, quality, asset-detail, inbox]
prd: OBS
last_updated: 2026-10-24
version: 1.0.0
summary: ตรวจจับและจัดการเหตุผิดปกติของข้อมูล ทั้ง schema ปริมาณ การกระจายตัว ความสดใหม่ และ pipeline พร้อมรวมการแจ้งเตือนที่ซ้ำกัน
---

## หน้านี้คืออะไร {#what}

หน้า **Data Observability** แสดงเหตุผิดปกติ (incident) ที่ตรวจพบในข้อมูล ทั้งปริมาณผิดปกติ schema เปลี่ยน การกระจายตัวของค่าเปลี่ยน ผลตรวจ contract และสุขภาพของ pipeline จาก OpenLineage RunEvents การแจ้งเตือนจะถูกส่งไปที่ Owner หรือ Steward และรวมรายการที่ซ้ำกันให้อัตโนมัติ

## วัตถุประสงค์และเป้าหมาย {#purpose}

- พบปัญหาข้อมูลก่อนผู้ใช้จะรู้ตัว (MTTD ต่ำ)
- ลดการแจ้งเตือนรบกวน โดยรวมการแจ้งเตือนที่ซ้ำกันเป็น incident เดียว
- ทำให้ทุก incident มีผู้รับผิดชอบ และกลายเป็นปัญหาข้อมูลที่มีคนติดตาม

## ใครใช้หน้านี้ {#who}

Steward, Owner, Custodian (Data Engineer) และผู้ดูแลระบบเป็นผู้รับเรื่อง (Acknowledge) ส่วนผู้ใช้ข้อมูล คณะกรรมการ และผู้ตรวจสอบดูได้อย่างเดียว

## วิธีใช้งาน {#how}

1. ดูการ์ดสรุป: **Open incidents**, **MTTD · 30 d**, **Alerts deduplicated** และ **Pipeline success · 24 h**
2. ใน **Incident timeline** กรองตามประเภท: All, Schema, Volume, Distribution, Pipeline, Freshness
3. ดูแต่ละ incident: เวลาและรหัส ความรุนแรง ประเภท สถานะ หัวข้อ ชุดข้อมูลที่กระทบ **Routed to** (ส่งให้ใคร) **Grouped** (รวมกี่การแจ้งเตือน) และ **Detected** (ตรวจพบหลังรันนานเท่าไร)
4. กด **Acknowledge** ที่ incident ที่ยัง Open เพื่อรับเรื่อง ระบบจะสร้าง Data Issue ให้
5. ใช้กราฟด้านขวา (Volume · WEB_EVENTS, Freshness · billing_monthly, Pipeline health) ยืนยันรูปแบบของปัญหา
6. กด **Alert settings** เพื่อกำหนดว่าใครจะได้รับการแจ้งเตือน

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **MTTD**: เวลาเฉลี่ยตั้งแต่เกิดปัญหาจนตรวจพบ ในรอบ 30 วัน (เป้าหมายไม่เกิน 30 นาที)
- **Alerts deduplicated**: เช่น 142 → 16 แปลว่าตัดการแจ้งเตือนรบกวนออกไปได้ 89%
- **Pipeline success · 24 h**: สัดส่วนการรันที่สำเร็จจากทั้งหมด
- **ความรุนแรง**: Critical, High, Medium, Low และ **สถานะ**: Open, Acknowledged, Resolved, Muted (อยู่ในช่วงปิดปรับปรุง)
- **3σ band**: กราฟปริมาณข้อมูลจะเตือนเมื่อค่าล่าสุดอยู่นอกช่วงที่คาดไว้
- **PSI**: ค่าวัดการเปลี่ยนแปลงของการกระจายตัว ถ้าเกิน 0.25 ถือว่าเปลี่ยนอย่างมีนัยสำคัญ

## งานที่ทำบ่อย {#tasks}

- จัดการ incident ระดับ Critical และ High ที่ยัง Open ก่อน เช่น pipeline FAIL หรือ schema เปลี่ยนแบบ breaking ขัดกับ contract
- เมื่อเจอ incident ประเภท Schema ให้ไปดูแท็บ **Contract** ของชุดข้อมูลนั้น
- ดูระยะเวลา p95 และผลรันล่าสุดของ pipeline ใน **Pipeline health**

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- incident ที่ขึ้น Muted คือเหตุที่เกิดในช่วงปิดปรับปรุง (maintenance window) ซึ่งตั้งได้ที่หน้า **ตั้งค่าการแจ้งเตือน**
- ถ้าไม่มีใครรับเรื่องภายใน 4 ชั่วโมง ระบบจะส่งต่อจาก Steward ไปให้ Owner อัตโนมัติ
