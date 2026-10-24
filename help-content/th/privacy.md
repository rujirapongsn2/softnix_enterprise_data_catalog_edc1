---
id: privacy
lang: th
title: ความเป็นส่วนตัวและ PDPA
nav_label: ความเป็นส่วนตัวและ PDPA
section: ธรรมาภิบาล
routes: [/privacy]
roles_full: [steward, dpo]
roles_view: [owner, custodian, council, auditor]
keywords: [ความเป็นส่วนตัว, PDPA, PII, ข้อมูลส่วนบุคคล, ข้อมูลอ่อนไหว, มาตรา 26, RoPA, ชั้นความลับ, สแกน, คิวตรวจ, inventory, mask, DPO]
related: [asset-detail, access, inbox, settings]
prd: CLS-02–06, AI-03
last_updated: 2026-10-24
version: 1.0.0
summary: ค้นหาข้อมูลส่วนบุคคล ให้ Steward ยืนยัน และเตรียมหลักฐาน RoPA ตาม PDPA
---

## หน้านี้คืออะไร {#what}

หน้า **ความเป็นส่วนตัวและ PDPA** ใช้ตรวจสอบและติดตามข้อมูลส่วนบุคคลที่พบใน Lakehouse และระบบต้นทาง ระบบจัดประเภทอัตโนมัติ (rule, regex, ML และ LLM) จะเสนอว่าคอลัมน์ไหนน่าจะเป็นข้อมูลส่วนบุคคล จากนั้น Steward ยืนยันทีละรายการ แท็กที่ยืนยันแล้วจะถูก sync ไปที่ Lakehouse เพื่อใช้ mask และควบคุมสิทธิ์

## วัตถุประสงค์และเป้าหมาย {#purpose}

- รู้ว่าข้อมูลส่วนบุคคลและข้อมูลอ่อนไหว (PDPA มาตรา 26) อยู่ที่ไหนบ้าง
- ไม่มีการติดแท็กหรือ mask ใด ๆ จนกว่า Steward จะยืนยัน
- จัดทำข้อมูลสำหรับบันทึกรายการกิจกรรมการประมวลผล (RoPA) ตาม PDPA มาตรา 39

## ใครใช้หน้านี้ {#who}

- **Data Steward** และ **DPO**: ยืนยันหรือปฏิเสธรายการที่ระบบเสนอ โดย DPO เป็นผู้ export ข้อมูล RoPA
- **Owner, Custodian, คณะกรรมการ, ผู้ตรวจสอบ**: ดูได้อย่างเดียว

## วิธีใช้งาน {#how}

1. ดูการ์ดสรุป 4 ใบ: Columns scanned, PII confirmed by steward, Datasets with personal data (และจำนวนที่เป็นข้อมูลอ่อนไหวตามมาตรา 26) และ Policy sync to Lakehouse
2. เปิดแท็บ **Review queue** แล้วใช้ปุ่ม **Confidence ≥ 90%** หรือ **Sensitive only** เพื่อโฟกัสรายการสำคัญ
3. อ่านแต่ละแถว ได้แก่ Column, Detected as, Confidence, Method, Evidence, Masked sample และ Proposed class แล้วกด ✓ (ยอมรับ) หรือ ✕ (ปฏิเสธ)
4. ถ้าจะตัดสินใจหลายรายการพร้อมกัน ให้ติ๊กเลือกหลายแถว แล้วกด **Accept** หรือ **Reject**
5. เปิดแท็บ **PII inventory** เพื่อดูจำนวนคอลัมน์แยกตามประเภท PII และแท็บ **Processing records** เพื่อดูตาราง RoPA

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **Confidence (ความมั่นใจ)**: สีเขียว ≥ 90%, สีส้ม ≥ 75%
- **Method**: Rule, Regex, ML หรือ **LLM**
- **Masked sample**: ค่าตัวอย่างที่ถูก mask แล้ว ใช้ประกอบการพิจารณาได้โดยไม่เห็นข้อมูลจริง
- **Proposed class**: ชั้นความลับที่คอลัมน์จะได้รับ เช่น Restricted
- **Policy sync to Lakehouse**: สัดส่วนแท็กที่ใช้งานจริงใน Lakehouse แล้ว แท็กที่ยังไม่ตรงกันจะถูกปรับให้ตรงตอน 02:00
- **Processing records**: Dataset, Purpose, Legal basis, Data subjects, Categories, Retention และ Complete %

## งานที่ทำบ่อย {#tasks}

- **Run scan** (Steward, Custodian, DPO, ผู้ดูแลระบบ): สั่งสแกนจัดประเภทอัตโนมัติรอบใหม่
- **Export RoPA input** (DPO, ผู้ตรวจสอบ): ดาวน์โหลดตาราง RoPA เป็นไฟล์ xlsx ภาษาไทย
- ยืนยันคอลัมน์อ่อนไหว เช่น `blood_group` (ข้อมูลสุขภาพ มาตรา 26) ซึ่งต้องให้ DPO ลงนามรับรอง

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- แท็กที่ยอมรับแล้วจะเข้าคิว sync ไป Lakehouse ส่วนรายการที่ปฏิเสธแล้วจะไม่ถูกเสนอซ้ำ
- **Privacy guard for AI**: ระบบไม่ส่งข้อมูลตัวอย่างให้ LLM, mask PII ก่อนส่ง และชุดข้อมูล Restricted ใช้ได้เฉพาะโมเดล on-prem
- ควรกรอก RoPA ที่ยังไม่ถึง 100% ให้ครบก่อนรับการตรวจ (เช่น WEB_EVENTS ที่ 40%)
