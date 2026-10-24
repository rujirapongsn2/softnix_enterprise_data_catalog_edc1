---
id: roles
lang: th
title: บทบาทและสิทธิ์ (Roles & Permissions)
nav_label: Roles & Permissions
section: ผู้ดูแลระบบ
routes: [/roles]
roles_full: [admin]
roles_view: [consumer, steward, owner, custodian, dpo, council, auditor]
keywords: [บทบาท, สิทธิ์, RBAC, ABAC, ตารางสิทธิ์, สลับบทบาท, ผู้ใช้, เชิญผู้ใช้, IdP group, Keycloak, DAMA, รีเซ็ตข้อมูลเดโม]
related: [getting-started, settings, audit, access]
prd: §3, NFR-01
last_updated: 2026-10-24
version: 1.0.0
summary: แต่ละบทบาทเห็นและทำอะไรได้บ้างใน EDC พร้อมรายชื่อผู้ใช้และการจับคู่กลุ่มจาก identity provider
---

## หน้านี้คืออะไร {#what}

หน้า **Roles & Permissions** แสดงการออกแบบสิทธิ์ตาม PRD v1.1 §3 (บทบาทตาม DAMA-DMBOK2) เป็นแบบ RBAC ที่จำกัดขอบเขตตามโดเมน ตารางสิทธิ์ชุดเดียวนี้ควบคุมทุกเมนู หน้า และปุ่มใน EDC1 มี 3 แท็บ คือ **Permission matrix**, **Roles** และ **Users & groups**

## วัตถุประสงค์และเป้าหมาย {#purpose}

- ให้เห็นชัดว่าแต่ละบทบาทเห็นและทำอะไรได้บ้าง
- จัดการผู้ใช้ และจับคู่กลุ่มจาก identity provider กับบทบาท

## ใครใช้หน้านี้ {#who}

ทุกบทบาทเปิดดูได้ แต่เฉพาะ **ผู้ดูแลระบบ** เท่านั้นที่เชิญผู้ใช้และจับคู่กลุ่มได้

## วิธีใช้งาน {#how}

1. **Permission matrix**: เลือกดู All, Pages หรือ Actions แต่ละช่องเป็น full (ใช้และแก้ไขได้), view (ดูได้อย่างเดียว) หรือ none (ซ่อนหรือล็อก) คอลัมน์ของบทบาทปัจจุบันจะถูกไฮไลต์ คลิกหัวคอลัมน์บทบาทเพื่อสลับไปใช้บทบาทนั้น
2. **Roles**: การ์ดของแต่ละบทบาท แสดงหน้าที่ สิทธิ์ใน EDC จำนวนฟังก์ชันที่ใช้ได้เต็มและดูได้อย่างเดียว และ persona สำหรับเดโม กด **Switch to this role** เพื่อลองใช้
3. **Users & groups**: ดูผู้ใช้ บทบาท ขอบเขตโดเมน วิธีที่ได้สิทธิ์ และสถานะ ใช้ **Invite user** เพื่อเชิญผู้ใช้ และเพิ่ม **IdP group → role mapping**
4. **Reset demo data** ล้างรายการที่สร้างจากฟอร์มในเดโม

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **บทบาท**: Data Consumer, Data Steward, Data Owner, Data Custodian / Engineer, DPO / Privacy Officer, Data Governance Council, Auditor, Platform Admin
- **Domain scope**: สิทธิ์ของ Owner และ Steward ใช้ได้เฉพาะในโดเมนที่ได้รับมอบหมาย
- **ABAC**: ข้อมูล Restricted หรือ PII จะมีกฎเพิ่มตามชั้นความลับ

## งานที่ทำบ่อย {#tasks}

- ตรวจว่าทำไมผู้ใช้บางคนมองไม่เห็นบางหน้า โดยหาแถวของหน้านั้นแล้วดูคอลัมน์ของบทบาทผู้ใช้
- เพิ่ม Steward คนใหม่ โดยเชิญผู้ใช้ หรือจับคู่กลุ่ม IdP ของเขากับบทบาท Data Steward ของโดเมนนั้น

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- การเข้าสู่ระบบใช้ OIDC ผ่าน Keycloak EDC ไม่เก็บรหัสผ่านใด ๆ
- บทบาทที่เลือกในเดโมจะถูกจำไว้ในเบราว์เซอร์นี้ (`edc1.role`)
