---
id: dashboard
lang: th
title: แดชบอร์ดธรรมาภิบาล
nav_label: แดชบอร์ดธรรมาภิบาล
section: ธรรมาภิบาล
routes: [/dashboard]
roles_full: [council]
roles_view: [steward, owner, custodian, dpo, auditor, admin]
keywords: [แดชบอร์ด, ธรรมาภิบาล, KPI, ความครอบคลุม, การใช้งาน, คุณภาพ, MTTD, MTTR, SLO, งานค้าง, เป้าหมาย, โดเมน, รายงาน, export]
related: [home, domains, quality, observability]
prd: AUD-02, §2.3
last_updated: 2026-10-24
version: 1.0.0
summary: ตัวชี้วัดความสำเร็จและคุณภาพของงานธรรมาภิบาลเทียบกับเป้าหมาย แยกตามโดเมน สำหรับติดตามและรายงานผล
---

## หน้านี้คืออะไร {#what}

**แดชบอร์ดธรรมาภิบาล** ติดตามตัวชี้วัดความสำเร็จและคุณภาพตาม PRD §2.3 เทียบกับเป้าหมายในช่วง 6 เดือนหลังเริ่มใช้งานจริง มี 2 แท็บ คือ **Coverage & adoption** (ความครอบคลุมและการใช้งาน) และ **Quality** (คุณภาพ)

## วัตถุประสงค์และเป้าหมาย {#purpose}

- ให้คณะกรรมการธรรมาภิบาลข้อมูลและเจ้าของโดเมนเห็นว่าส่วนไหนถึงเป้าแล้วและส่วนไหนยังไม่ถึง
- จัดลำดับงานค้าง เช่น การกำหนดเจ้าของ การยืนยัน PII คำศัพท์ ปัญหาข้อมูล และงานที่เกิน SLA

## ใครใช้หน้านี้ {#who}

คณะกรรมการธรรมาภิบาลข้อมูลใช้มากที่สุดและ export รายงานได้ Owner, DPO และผู้ตรวจสอบก็ export ได้เช่นกัน ส่วนบทบาทอื่นดูได้อย่างเดียว

## วิธีใช้งาน {#how}

1. เลือกโดเมนจากตัวเลือก **All domains** เพื่อดูเฉพาะโดเมนนั้น
2. แท็บ **Coverage & adoption**: ดูการ์ดตัวชี้วัด (Harvest coverage, Ownership · Critical, Documentation · Critical, PII confirmed, Lineage · Critical, Monthly active users) ตาราง **Coverage by domain** การ์ด **Backlog** **Access request lead time** และ **Top stewards this month**
3. แท็บ **Quality**: ดู DQ rule coverage · CDE, Data products meeting SLO, MTTD, MTTR, Issues with root cause และ Contract violations (30 d) พร้อมตาราง **Monthly domain quality review (PDCA)**
4. กด **Export PDF (TH)** เพื่อส่งรายงานต่อ

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **On track / pts to go**: ถึงเป้าแล้ว หรือยังขาดอีกกี่คะแนน
- **Critical-asset completeness**: สัดส่วนชุดข้อมูลสำคัญที่มี metadata ครบ แยกตามโดเมน
- **MTTD / MTTR**: เวลาเฉลี่ยในการตรวจพบปัญหา (นาที) และแก้ไขปัญหา (วัน) ยิ่งต่ำยิ่งดี
- **Access request lead time**: จำนวนวันทำการเฉลี่ยตั้งแต่ขอสิทธิ์จนได้สิทธิ์ (เป้าหมายไม่เกิน 2 วัน)
- **Backlog**: งานค้าง เช่น ชุดข้อมูลสำคัญที่ยังไม่มีเจ้าของ PII ที่รอยืนยัน และงาน workflow ที่เกิน SLA

## งานที่ทำบ่อย {#tasks}

- เตรียมประชุมคณะกรรมการประจำเดือน โดย export PDF แล้วทบทวนโดเมนที่ยังไม่ถึงเป้า
- กำหนดเจ้าของให้ชุดข้อมูลสำคัญที่ยังไม่มีเจ้าของ

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- คะแนนรีวิวจากผู้ใช้ที่ต่ำ (≤ 2 ดาว) และปัญหาที่เกิดซ้ำ จะถูกนำไปเสนอเป็นกฎ DQ ใหม่หรือการปรับ contract
- หน้าแรกแสดง KPI เหล่านี้ในแบบย่อ
