---
id: settings
lang: th
title: ตั้งค่า
nav_label: ตั้งค่า
section: ผู้ดูแลระบบ
routes: [/settings]
roles_full: [admin]
roles_view: [custodian, auditor]
keywords: [ตั้งค่า, AI provider, โมเดล, guardrails, Ask Softnix, MCP server, metamodel, attribute, ภาษา, ปฏิทิน, identity provider, Keycloak]
related: [roles, audit, sources, privacy]
prd: AI-09/10, MCP, CAT-03
last_updated: 2026-10-24
version: 1.0.0
summary: ตั้งค่าแพลตฟอร์ม ทั้งโมเดล AI และ guardrails, MCP server, metamodel และค่าทั่วไป โดยไม่ต้อง deploy ใหม่
---

## หน้านี้คืออะไร {#what}

หน้า **ตั้งค่า (Settings)** ใช้ปรับการทำงานของ EDC โดยไม่ต้อง deploy ใหม่ มี 4 แท็บ คือ **AI & Ask Softnix**, **MCP server**, **Metamodel** และ **General**

## วัตถุประสงค์และเป้าหมาย {#purpose}

- ควบคุมว่าจะใช้โมเดล AI ตัวไหน และปกป้องข้อมูลอย่างไรเมื่อใช้ AI
- ให้เครื่องมือ AI ภายนอกใช้แคตตาล็อกได้อย่างปลอดภัยผ่าน MCP
- เพิ่ม metadata ที่ต้องเก็บสำหรับชุดข้อมูลแต่ละประเภท

## ใครใช้หน้านี้ {#who}

เฉพาะ **ผู้ดูแลระบบ (Platform Admin)** ที่แก้ไขได้ ส่วน Custodian และผู้ตรวจสอบดูได้อย่างเดียว

## วิธีใช้งาน {#how}

1. **AI & Ask Softnix**: ดู **Model providers** ของแต่ละฟีเจอร์ (ทั้งหมดติดตั้งแบบ on-prem) และตั้งค่า **Guardrails** ได้แก่ การส่งข้อมูลตัวอย่างให้ LLM, การ mask PII ก่อนส่ง, ชุดข้อมูล Restricted ใช้ได้เฉพาะ on-prem, โหมดให้ AI บันทึกแบบต้องยืนยันก่อน, เสียง และประวัติแชต ด้านล่างแสดงโควตา token
2. **MCP server**: ดู endpoint, transport, การยืนยันตัวตน (OAuth 2.1 ผ่าน Keycloak), write tools (เสนอได้อย่างเดียว), rate limit, client ที่อนุญาต และ tool ที่มีให้ใช้
3. **Metamodel**: ดูรายการ attribute ที่เพิ่มเองแยกตามประเภทชุดข้อมูล แล้วกด **New attribute** เพื่อเพิ่ม
4. **General**: ภาษาเริ่มต้น ปฏิทิน (ค.ศ. / พ.ศ.) identity provider และ tenant

## ฟิลด์และตัวชี้วัดสำคัญ {#fields}

- **Guardrails** กำหนดว่า AI เห็นอะไรและทำอะไรได้ ค่าเริ่มต้นคือไม่ส่งข้อมูลตัวอย่าง, mask PII และใช้เฉพาะ on-prem กับชุดข้อมูล Restricted
- **Write tools: Proposals only → workflow**: client ผ่าน MCP แก้ metadata ตรง ๆ ไม่ได้ ทุกการแก้ไขจะกลายเป็นงานใน workflow
- **Required** ของ attribute: เช่น Critical, Yes หรือ "If PII" (บังคับเมื่อมี PII)

## งานที่ทำบ่อย {#tasks}

- เพิ่ม attribute เช่น "Cost center" ให้ Data Product
- อนุญาต MCP client ตัวใหม่หลังผ่านการตรวจความปลอดภัย

## เคล็ดลับและคำถามที่พบบ่อย {#tips}

- ทุกการเปลี่ยนการตั้งค่าจะถูกบันทึกไว้ใน **ประวัติการตรวจสอบ**
- ถ้าช่องติ๊กถูกล็อก แปลว่าบทบาทของคุณดูการตั้งค่าได้อย่างเดียว
