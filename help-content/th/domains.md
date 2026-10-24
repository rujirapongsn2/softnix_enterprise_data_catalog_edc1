---
id: domains
lang: th
title: โดเมนและ Data Product
nav_label: โดเมนและ Data Product
section: ค้นหาข้อมูล
routes: [/domains]
roles_full: [steward, owner, custodian, council]
roles_view: [consumer, dpo, auditor, admin]
keywords: [โดเมน, data product, ผลิตภัณฑ์ข้อมูล, SLA, SLO, error budget, ผู้ใช้ข้อมูล, เจ้าของโดเมน, critical completeness, data mesh]
related: [asset-detail, search, dashboard, quality]
prd: CAT-09
last_updated: 2026-10-24
version: 1.0.0
summary: โดเมนธุรกิจและ Data Product ที่แต่ละโดเมนเผยแพร่ พร้อมเจ้าของ SLA/SLO และข้อมูลการใช้งาน
---

## หน้านี้คืออะไร {#what}

หน้า **โดเมนและ Data Product** จัดกลุ่มชุดข้อมูลตามโดเมนธุรกิจ (Customer, Finance, Sales, HR, Marketing, Operations) และแสดง **Data Product** ซึ่งเป็นชุดข้อมูลที่คัดมาแล้ว มีเจ้าของ มี SLA มีคู่มือการใช้ และติดตาม SLO เช่น Customer 360 หรือ Monthly Revenue Mart

## วัตถุประสงค์และเป้าหมาย {#purpose}

- ระบุให้ชัดว่าใครรับผิดชอบข้อมูลแต่ละด้าน
- ให้ผู้ใช้เลือก Data Product ที่พร้อมใช้และมีคนดูแล แทนการไปใช้ตารางดิบ
- แสดงระดับบริการให้เห็นชัด ทั้ง SLA, การบรรลุ SLO และ error budget

## ใครใช้หน้านี้ {#who}

Owner และ Steward สร้างและดูแล Data Product, Custodian ดูแลการทำงานเชิงเทคนิค, ผู้ใช้ข้อมูลเข้ามาเลือกใช้ ส่วนบทบาทอื่นดูได้อย่างเดียว

## วิธีใช้งาน {#how}

1. ดูการ์ด **Data products** แต่ละใบแสดงโดเมน คำอธิบาย SLA ป้าย SLO จำนวนชุดข้อมูลและผู้ใช้ คะแนน และเจ้าของ
2. กด **Open** เพื่อไปที่ชุดข้อมูลหลักของ product นั้น
3. เลื่อนลงไปที่ **Domains** แล้วคลิกการ์ดโดเมนเพื่อค้นหาชุดข้อมูลทั้งหมดในโดเมนนั้น
4. สำหรับ Owner และ Steward: กด **New data product** เพื่อสร้างใหม่ (เริ่มต้นเป็น Draft)

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **SLA**: ระดับบริการที่สัญญาไว้ เช่น "Daily by 06:00 · 99.5%" (พร้อมใช้ทุกวันก่อน 06:00)
- **ป้าย SLO**: Freshness, Completeness, Volume, DQ, Availability พร้อมอัตราที่ทำได้ใน 30 วัน ✓ คือผ่าน ✕ คือไม่ผ่าน
- **Error budget**: โควตาความผิดพลาดที่ยังเหลือในรอบนี้ ถ้าเหลือ 0% แปลว่าใช้หมดแล้ว
- **ไอคอนโล่**: Data Product นี้ได้รับการรับรองแล้ว
- การ์ดโดเมนแสดง **assets**, **certified**, **products**, **Critical completeness** % และ **Domain owner**

## งานที่ทำบ่อย {#tasks}

- เลือก Data Product มาใช้วิเคราะห์ โดยเลือกตัวที่รับรองแล้ว SLO ผ่าน และยังมี error budget เหลือ
- หาโดเมนที่ Critical completeness ต่ำ แล้วประสานกับเจ้าของโดเมน

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- Product ที่ใช้ error budget หมดแล้ว (เช่น Digital Engagement ที่ 0%) ควรได้รับการทบทวนก่อนให้ผู้ใช้ใหม่นำไปใช้
- วางเมาส์บนป้าย SLO เพื่อดูเป้าหมายและอัตราที่ทำได้ใน 30 วัน
