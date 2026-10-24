---
id: quality
lang: th
title: คุณภาพข้อมูล
nav_label: คุณภาพข้อมูล
section: ธรรมาภิบาล
routes: [/quality]
roles_full: [steward, owner, custodian]
roles_view: [consumer, dpo, council, auditor, admin]
keywords: [คุณภาพข้อมูล, DQ, กฎ, คะแนน, Great Expectations, GX, มิติคุณภาพ, เกณฑ์, ความสดใหม่, ปัญหาข้อมูล, CDE]
related: [asset-detail, observability, inbox, dashboard]
prd: DQ
last_updated: 2026-10-24
version: 1.0.0
summary: ภาพรวมกฎคุณภาพข้อมูล คะแนน และปัญหาข้อมูลที่ยังเปิดอยู่ของทุกชุดข้อมูล
---

## หน้านี้คืออะไร {#what}

หน้า **คุณภาพข้อมูล (Data Quality)** แสดงภาพรวมคุณภาพของทั้งแคตตาล็อก กฎกำหนดไว้ที่นี่ แล้ว DQ engine ของ Lakehouse (Great Expectations + PySpark) เป็นผู้รัน ผลลัพธ์จะส่งกลับมาที่ EDC ผ่าน API หรือ OpenLineage

## วัตถุประสงค์และเป้าหมาย {#purpose}

- หาชุดข้อมูลที่คะแนนต่ำที่สุดเพื่อแก้ไขก่อน
- ทำให้ข้อมูลสำคัญมีกฎตรวจครบ และเมื่อกฎไม่ผ่าน จะกลายเป็นปัญหาข้อมูลที่มีคนติดตาม

## ใครใช้หน้านี้ {#who}

Steward, Owner และ Custodian สร้างและนำเข้ากฎ ส่วนบทบาทอื่นดูได้อย่างเดียว

## วิธีใช้งาน {#how}

1. ดูการ์ดสรุป: **Avg score · Critical**, **Rules** (รวมกฎที่ AI แนะนำซึ่งรอตรวจ), **Failing rules** และ **Freshness SLA breaches**
2. ในตาราง **Datasets by score (lowest first)** ดู Score, Trend, Freshness และ Open issues
3. คลิกชุดข้อมูลเพื่อเปิดแท็บ **คุณภาพข้อมูล** ของชุดนั้นและดูผลรายกฎ
4. ติดตามรายการใน **Open data issues** (สถานะ Assigned, Root cause, Corrective action, Closed)

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **สีของคะแนน**: เขียว ≥ 95%, ส้ม ≥ 85%, แดงต่ำกว่า 85%
- **มิติคุณภาพ**: Accuracy (ความถูกต้อง), Completeness (ความครบถ้วน), Validity (ความสมเหตุสมผล), Consistency (ความสอดคล้อง), Uniqueness (ไม่ซ้ำ), Timeliness (ความทันเวลา)
- **กฎ (Rule)**: ประกอบด้วยคอลัมน์ มิติ GX expectation ความรุนแรง เกณฑ์ และคะแนน ถ้าคะแนนต่ำกว่าเกณฑ์ถือว่าไม่ผ่าน
- **Freshness SLA breach**: ข้อมูลมาช้ากว่าที่กำหนด ระบบจะสร้าง Data Issue ให้อัตโนมัติ

## งานที่ทำบ่อย {#tasks}

- **New rule**: เลือกชุดข้อมูล คอลัมน์ มิติ expectation ความรุนแรง เกณฑ์ และสิ่งที่ต้องทำเมื่อไม่ผ่าน กฎใหม่จะรอผลจากการรัน GX รอบแรก
- **Import GX suites**: อัปโหลดชุดกฎ Great Expectations (.json)
- ตรวจกฎที่ AI แนะนำในแท็บคุณภาพข้อมูลของแต่ละชุดข้อมูล แล้วกด **Add to suite**

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- กฎของคอลัมน์ CDE มีน้ำหนักเป็น 2 เท่าในคะแนน DQ
- ชุดข้อมูลที่รับรองแล้วจะถูกถอนการรับรองอัตโนมัติ ถ้าคะแนนต่ำกว่าเกณฑ์ 3 รอบติดกัน
- ถ้าต้องการดูความผิดปกติแบบเรียลไทม์ (ปริมาณ, schema, pipeline ล้มเหลว) ให้ไปที่ **การเฝ้าระวังข้อมูล**
