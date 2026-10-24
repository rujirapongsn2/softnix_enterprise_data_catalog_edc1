---
id: sources
lang: th
title: แหล่งข้อมูลและการดึง Metadata
nav_label: แหล่งข้อมูลและการดึง Metadata
section: ผู้ดูแลระบบ
routes: [/sources]
roles_full: [custodian, admin]
roles_view: [steward, auditor]
keywords: [แหล่งข้อมูล, connector, harvest, ดึง metadata, Iceberg, Oracle, Snowflake, Power BI, OpenLineage, Trino, profiling, remote agent, ตารางเวลา, ทดสอบการเชื่อมต่อ]
related: [home, privacy, asset-detail, settings]
prd: HRV
last_updated: 2026-10-24
version: 1.0.0
summary: เชื่อมต่อระบบต้นทางและดึง metadata ตามรอบเวลา โดยไม่คัดลอกตัวข้อมูลจริง
---

## หน้านี้คืออะไร {#what}

หน้า **แหล่งข้อมูลและการดึง Metadata (Sources & Harvest)** แสดง connector ที่อ่าน metadata จาก Lakehouse ฐานข้อมูล cloud storage เครื่องมือ BI และ API/ไฟล์ connector อ่าน **เฉพาะ metadata** ข้อมูลรับรอง (credential) เก็บไว้ใน secret store และ Lakehouse ยังเป็นระบบหลัก (system of record) เหมือนเดิม

## วัตถุประสงค์และเป้าหมาย {#purpose}

- ทำให้แคตตาล็อกครบถ้วนและเป็นปัจจุบันโดยอัตโนมัติ
- เห็นการดึงข้อมูลที่ล้มเหลวหรือได้ไม่ครบได้เร็ว ข้อมูลในแคตตาล็อกจะได้ไม่ล้าสมัย

## ใครใช้หน้านี้ {#who}

Custodian / Data Engineer และผู้ดูแลระบบเป็นผู้เพิ่มและสั่งรันแหล่งข้อมูล ส่วน Steward และผู้ตรวจสอบดูได้อย่างเดียว

## วิธีใช้งาน {#how}

1. ดูการ์ดสรุป: Sources, Assets harvested, Schema changes (24h) และ Failed sources
2. กรองตามกลุ่ม: All, Lakehouse, Databases, Cloud platforms, Storage, BI, API & files
3. คลิกแถวเพื่อดูรายละเอียด: Connection, Credential (อ้างอิงใน vault), รูปแบบ Include / Exclude, Profiling และ Recent runs
4. กด **Run** เพื่อดึงทันที, **Test connection** เพื่อทดสอบการเชื่อมต่อ หรือ **Configure** เพื่อแก้ไขการตั้งค่า
5. กด **Add source** เพื่อเริ่มวิซาร์ด 7 ขั้น: Source type → Connection → Credentials & test → Scope → Schedule → Governance & PII → Review & create

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **Status**: Healthy, Warning, Failed, Running, Queued
- **Last run**: การดึงครั้งล่าสุดเกิดเมื่อไรและผลเป็นอย่างไร เช่น "3 tables skipped (permission)" หรือ "ORA-12170 connect timeout"
- **Schedule**: เช่น ทุก 1 ชั่วโมงร่วมกับ DDL events, ทุกวัน 23:00 หรือแบบ push เรียลไทม์
- ป้าย **lineage**: แหล่งนี้ส่ง lineage มาด้วย, ป้าย **remote agent**: ดึงผ่าน agent ที่ติดตั้งในองค์กร

## งานที่ทำบ่อย {#tasks}

- แก้แหล่งข้อมูลที่ดึงไม่สำเร็จ: อ่าน error ใน Recent runs, กด **Test connection** และตรวจการออกเครือข่ายของ agent
- เพิ่มฐานข้อมูลใหม่ แล้วกำหนดโดเมน Owner Steward และการสแกน PII ในวิซาร์ด

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- การทำ profiling สุ่มตัวอย่างแถว (เช่น 100k แถว) บน resource group ที่มีลำดับความสำคัญต่ำ และไม่เก็บค่าจริงไว้
- ปุ่ม **Remote agents** ที่มุมขวาบนบอกว่ามี agent ในองค์กรตัวไหนออนไลน์อยู่บ้าง
