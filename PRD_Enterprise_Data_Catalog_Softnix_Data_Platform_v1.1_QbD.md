# PRD — Enterprise Data Catalog (Softnix Data Platform)

Oct 13, 2026 · v1.1 (QbD) · @Rujirapong R

## บันทึกการเปลี่ยนแปลง (Changelog)

| เวอร์ชัน | วันที่ | สรุปการเปลี่ยนแปลง |
| --- | --- | --- |
| v1.1 (QbD) | Oct 13, 2026 | ปรับตามรีวิว Quality by Design สำหรับ Data Management Platform: (1) เพิ่มกลุ่ม CTR Data Contract ตาม Open Data Contract Standard (หัวข้อ 5.6.1); (2) ยก CAT-09, DQ-04, DQ-05 เป็น M และขยาย SLA เป็น SLO หลายมิติพร้อม error budget (DQ-06); (3) นิยามสูตร DQ score และผูก certification กับเกณฑ์ DQ + completeness + contract compliance พร้อม auto-decertify (DQ-07, CERT-01 ถึง CERT-03); (4) เพิ่ม Observability: anomaly ของ volume/schema/distribution, pipeline health จาก OpenLineage, alert routing พร้อม dedup และ maintenance window (OBS-01 ถึง OBS-05); (5) เพิ่ม KPI คุณภาพใน 2.3 และรอบ quality review รายเดือนต่อ Domain (WF-06); (6) ยก GLO-06 เป็น M สำหรับ asset ใหม่ใน Silver/Gold และเป็นเงื่อนไขก่อน publish |
| v1.0 | Oct 9, 2026 | ฉบับปรับจาก PRD Draft v0.1 (EW/UU) |

## 1. ภาพรวมและขอบเขต

Softnix Enterprise Data Catalog (EDC) คือแอปพลิเคชันที่ดึง metadata จาก Data Lakehouse Platform ที่มีอยู่ (แหล่งหลัก) และจาก Database / Cloud Data Platform อื่น มาจัดเป็นทะเบียนข้อมูลกลางที่ค้นหาได้ มีเจ้าของ มีนิยาม มีการจัดชั้นความลับ และตรวจสอบย้อนกลับได้ ตามหลัก Data Governance

PRD ฉบับนี้ปรับจาก PRD เดิม (Draft v0.1 สำหรับโครงการ EW/UU) โดยตัดส่วนที่ผูกกับ TOR และงานที่ Lakehouse ทำอยู่แล้วออก เหลือเฉพาะความสามารถมาตรฐานของ Enterprise Data Catalog

### 1.1 สิ่งที่อยู่ในขอบเขต

- เก็บเกี่ยว (harvest) metadata เชิงเทคนิค, lineage และผลคุณภาพข้อมูลจาก Lakehouse อัตโนมัติ (Iceberg, Spark, Trino, OpenLineage, Great Expectations) และจาก Database / Cloud Data Platform อื่นผ่าน connector
- เติม metadata เชิงธุรกิจ: Glossary, นิยาม, เจ้าของ, Steward, Domain, Data Product
- จัดชั้นความลับและติดป้ายข้อมูลส่วนบุคคล (PDPA) ทั้งแบบอัตโนมัติและแบบคนยืนยัน
- ค้นหาและค้นพบข้อมูล (Search & Discovery) สำหรับผู้ใช้ทั่วองค์กร
- Workflow ธรรมาภิบาล: รับรองชุดข้อมูล, ขอสิทธิ์, ขอเปลี่ยนแปลง, แจ้งปัญหาข้อมูล
- ส่งนโยบาย (tag, classification, access) กลับไปบังคับใช้ที่ Lakehouse ผ่าน API
- Ask Softnix — AI Chatbot ผู้เชี่ยวชาญ (text + voice) อยู่ทุกหน้า และ AI (LLM) ช่วยสร้าง ตรวจสอบ ค้นพบ ตรวจจับ และอธิบาย metadata เพื่อลดงานทำ catalog ด้วยมือ
- MCP server ให้ AI agent ภายนอกค้นหาและใช้ catalog ได้ตามสิทธิ์ผู้ใช้
- โครงสร้างข้อมูลและ API ที่รองรับ module MDM ในอนาคต
- Web app สองภาษา อังกฤษเป็นค่าเริ่มต้น สลับเป็นไทยได้; ติดตั้งแยกจาก Lakehouse และยืนยันตัวตนผ่าน OpenID Connect (OIDC)

### 1.2 สิ่งที่อยู่นอกขอบเขต

| หัวข้อ | เหตุผล | อยู่ที่ |
| --- | --- | --- |
| Data Integration / ETL / CDC / Ingestion | มีใน Lakehouse แล้ว | Lakehouse Platform |
| Engine รัน Data Quality check | มีแล้ว (Great Expectations + PySpark); EDC เป็นที่นิยาม rule และแสดงผล ไม่รันเอง | DQ engine ของ Lakehouse |
| Query engine / Storage / Compute | Catalog อ่าน metadata เท่านั้น | Lakehouse Platform |
| BI / Reporting / Dashboard ธุรกิจ | ไม่ใช่หน้าที่ของ catalog | เครื่องมือ BI |
| MDM เต็มรูปแบบ (golden record) | เป็น module ในอนาคต; EDC ออกแบบ data model, workflow และ API ให้ต่อได้ (หัวข้อ 5.14) | Module MDM (เฟสถัดไป) |
| ระบบ RoPA / Consent Management เต็มรูปแบบ | Catalog ส่งออกข้อมูลประกอบ RoPA ได้เท่านั้น | ระบบ PDPA ขององค์กร |
| ฟังก์ชันเฉพาะโครงการ เช่น Close Cycle Calendar, Validation Gate ตาม TOR, Test Scenario Workshop | เฉพาะลูกค้า ไม่ใช่มาตรฐาน catalog | Extension รายโครงการ (ดูหัวข้อ 8) |

## 2. ปัญหา เป้าหมาย และตัวชี้วัด

ข้อมูลใน Lakehouse เพิ่มขึ้นทุกวันจาก pipeline ที่มีอยู่ แต่ผู้ใช้ไม่รู้ว่าตารางไหนคืออะไร ใครเป็นเจ้าของ เชื่อถือได้แค่ไหน และมีข้อมูลส่วนบุคคลอยู่ตรงไหน EDC แก้ปัญหานี้โดยให้ metadata ไหลเข้าอัตโนมัติ และให้คนเติมเฉพาะส่วนที่เครื่องทำไม่ได้

### 2.1 ปัญหาที่ต้องแก้

| # | ปัญหา | ผลกระทบ | EDC ช่วยอย่างไร |
| --- | --- | --- | --- |
| PB-1 | หาข้อมูลไม่เจอ ต้องถามคน | เสียเวลาหาข้อมูลนานกว่าใช้ข้อมูล | Search ไทย/อังกฤษ + Glossary |
| PB-2 | ไม่รู้ว่าใครเป็นเจ้าของข้อมูล | ไม่มีคนรับผิดชอบเมื่อข้อมูลผิด | Ownership บังคับสำหรับ asset สำคัญ |
| PB-3 | มีหลายตารางคล้ายกัน ให้ผลไม่ตรงกัน | รายงานขัดแย้ง | Certified / Authoritative badge, Data Product |
| PB-4 | ไม่รู้ที่มาและผลกระทบเมื่อแก้ schema | pipeline พัง รายงานผิดโดยไม่รู้ตัว | Lineage ระดับ table/column + impact analysis |
| PB-5 | ไม่รู้ว่าข้อมูลส่วนบุคคลอยู่ที่ใด | เสี่ยง PDPA | Auto-classification + PII tag + export ประกอบ RoPA |
| PB-6 | ไม่รู้คุณภาพและความสดใหม่ของข้อมูล | ตัดสินใจจากข้อมูลเก่าหรือผิด | DQ score + freshness บนหน้า asset |
| PB-7 | ขอสิทธิ์ข้อมูลผ่านอีเมล/แชท ไม่มีหลักฐาน | ตรวจสอบย้อนหลังไม่ได้ | Access Request workflow + audit trail |

### 2.2 เป้าหมาย

| ID | เป้าหมาย |
| --- | --- |
| G-1 | Asset ทั้งหมดใน Lakehouse ปรากฏใน catalog อัตโนมัติ ไม่ต้องลงทะเบียนด้วยมือ |
| G-2 | Asset สำคัญ (Critical) มีเจ้าของ, Steward, นิยาม และ classification ครบ |
| G-3 | คำศัพท์ธุรกิจอยู่ใน Glossary เดียว ผูกกับ column จริง |
| G-4 | ข้อมูลส่วนบุคคลถูกตรวจพบและติดป้าย และนโยบายถูกบังคับใช้ที่ Lakehouse |
| G-5 | Lineage จากแหล่งต้นทางถึงรายงาน ใช้ทำ impact analysis ได้ |
| G-6 | ทุกการเปลี่ยนแปลงและการอนุมัติมี audit trail ตรวจสอบได้ |

### 2.3 ตัวชี้วัดความสำเร็จ

ค่าเป้าหมายเป็นค่าเสนอ ต้องตกลงกับลูกค้าแต่ละราย

| ตัวชี้วัด | วิธีวัด | เป้าหมายเสนอ (6 เดือนหลัง go-live) |
| --- | --- | --- |
| Harvest coverage | % ของ table/view ใน Lakehouse ที่อยู่ใน catalog | 100% |
| Ownership coverage | % Critical asset ที่มี Owner + Steward | ≥ 95% |
| Documentation coverage | % Critical asset ที่มีคำอธิบายและ glossary term | ≥ 80% |
| PII coverage | % column ที่สแกนแล้ว และ PII tag ที่คนยืนยันแล้ว | 100% สแกน / ≥ 90% ยืนยัน |
| Lineage coverage | % Critical asset ที่มี upstream lineage | ≥ 90% |
| Adoption | ผู้ใช้งานรายเดือน (MAU) / ผู้ใช้ข้อมูลทั้งหมด | ≥ 60% |
| Access request lead time | เวลาเฉลี่ยตั้งแต่ขอถึงได้สิทธิ์ | ≤ 2 วันทำการ |

ตัวชี้วัดคุณภาพข้อมูล (เพิ่มใน v1.1 เพื่อปิด loop ตามหลัก QbD) แสดงใน Governance Dashboard แท็บ Quality แยกตาม Domain และแนวโน้ม

| ตัวชี้วัด | วิธีวัด | เป้าหมายเสนอ (6 เดือนหลัง go-live) |
| --- | --- | --- |
| DQ rule coverage ของ CDE | % Critical Data Element ที่มี DQ rule ที่ active อย่างน้อย 1 rule | ≥ 90% |
| SLO attainment | % Data Product ที่ผ่านทุก SLO ในรอบ 30 วัน (DQ-06) | ≥ 90% |
| MTTD | เวลาเฉลี่ยตั้งแต่ปัญหาเกิด (run/harvest) ถึงระบบสร้าง incident หรือ Data Issue | ≤ 30 นาที |
| MTTR | เวลาเฉลี่ยตั้งแต่เปิดถึงปิด Data Issue severity High ขึ้นไป | ≤ 2 วันทำการ |
| Root cause coverage | % Data Issue ที่ปิดแล้วและระบุ root cause | ≥ 80% |
| Contract violations | จำนวน breaking change หรือการละเมิด contract ต่อเดือน (CTR-03) | ลดลงทุกไตรมาส, ≤ 5 ต่อเดือน |

## 3. ผู้ใช้งานและบทบาท

บทบาทอิง DAMA-DMBOK2 และตั้งค่าได้ตาม RACI ของแต่ละองค์กร คนหนึ่งคนมีได้หลายบทบาท และบทบาทกำหนดขอบเขตตาม Domain ได้

| บทบาท | หน้าที่ตาม Data Governance | สิทธิ์หลักใน EDC |
| --- | --- | --- |
| Data Governance Council | กำหนดนโยบาย มาตรฐาน และตัดสินข้อพิพาทข้าม Domain | อนุมัติ classification scheme, policy, glossary ระดับองค์กร; ดู governance dashboard |
| Data Owner | ผู้บริหารฝั่งธุรกิจที่ accountable ต่อข้อมูลใน Domain | อนุมัติ access request, certify asset, อนุมัติ change request |
| Data Steward | ดูแลคุณภาพและความหมายของข้อมูลเชิงปฏิบัติ | แก้ไข business metadata, ดูแล glossary, ยืนยัน classification, จัดการ data issue |
| Data Custodian / Data Engineer | ดูแลข้อมูลเชิงเทคนิคบน Lakehouse | ดูแล technical metadata, ตั้งค่า connector, ดู lineage และ impact |
| Data Consumer (Analyst, Data Scientist, ผู้ใช้ธุรกิจ) | ใช้ข้อมูลตามวัตถุประสงค์ที่ได้รับอนุญาต | ค้นหา, ดูรายละเอียด, ขอสิทธิ์, แจ้งปัญหา, ให้ rating/comment |
| DPO / Privacy Officer | กำกับการปฏิบัติตาม PDPA | ดู PII inventory, อนุมัติ access ข้อมูลอ่อนไหว, export ข้อมูลประกอบ RoPA |
| Auditor | ตรวจสอบการปฏิบัติตามนโยบาย | อ่านอย่างเดียว: audit trail, ประวัติการอนุมัติ |
| Platform Admin | ดูแลระบบ EDC | ผู้ใช้, บทบาท, SSO, connector, metamodel, backup |

## 4. สถาปัตยกรรมและการเชื่อมต่อกับ Lakehouse

EDC ติดตั้งแยกจาก Lakehouse เป็น standalone service (database, search index, compute ของตัวเอง) ยืนยันตัวตนผู้ใช้ผ่าน OIDC กับ IdP ขององค์กร และเชื่อมกับ Lakehouse ผ่าน network/API เท่านั้น ผ่าน Integration layer 4 ตัว (สีเน้น): อ่าน metadata และ lineage ขึ้นมา ส่ง query ตัวอย่างและนโยบายลงไป โดยไม่ย้ายหรือเก็บข้อมูลจริง

&#91;embedded content: สถาปัตยกรรม EDC × Lakehouse · 4 จุดเชื่อม\]

| จุดเชื่อม | ทิศทาง | วิธี | สิ่งที่ต้องมีฝั่ง Lakehouse | ความต้องการ |
| --- | --- | --- | --- | --- |
| Iceberg catalog | Lakehouse → EDC | Pull ตาม schedule: namespace, table, schema evolution, partition spec, snapshot | Iceberg catalog API แบบ read-only | HRV-01 ถึง HRV-05 |
| Spark jobs | Lakehouse → EDC | Push OpenLineage event จาก Spark integration ที่มีอยู่ | Endpoint ปลายทางชี้มาที่ EDC | LIN-01, LIN-03 |
| Manual lineage | Lakehouse → EDC | Sync lineage ที่ผู้ใช้สร้างเองใน Lakehouse | API อ่าน manual lineage | LIN-06 |
| Trino | EDC → Lakehouse | SQL profiling / sampling แบบจำกัด resource | Service account + resource group | HRV-06, CLS-02, AI-02 |
| DQ engine (Great Expectations + PySpark) | สองทาง | EDC ส่ง expectation suite ที่อนุมัติแล้ว; รับ validation result กลับ | ช่องทางรับ suite และส่งผล (API หรือไฟล์ JSON) | DQ-02, DQ-03 |
| Access control | EDC → Lakehouse | API จัดการ tag / grant | API role, tag, masking policy (ต้องยืนยัน) | ACC-02, ACC-03 |
| Trino query log | Lakehouse → EDC | Pull | Query history | SRC-03, ACC-04 |
| LLM provider | EDC → LLM | OpenAI-compatible API (on-prem หรือ cloud) | — | AI-09, AI-10 |
| AI agent ภายนอก | Client → EDC | MCP server | — | MCP-01 ถึง MCP-05 |

จุดเชื่อมนอก Lakehouse:

| จุดเชื่อม | ทิศทาง | วิธี | ความต้องการ |
| --- | --- | --- | --- |
| OIDC Identity Provider (เช่น Keycloak, Microsoft Entra ID) | IdP ↔ EDC | Authorization Code + PKCE; อ่าน group/claim ไป map เป็นบทบาท | NFR-01 |
| Database (เช่น PostgreSQL, MySQL, SQL Server, Oracle) | Source → EDC | JDBC / native driver อ่าน information schema | HRV-10 |
| Cloud Data Platform (เช่น Snowflake, BigQuery, Redshift, Databricks, Azure Synapse) | Source → EDC | API / JDBC ของแต่ละ platform รวม lineage และ query history เมื่อมี | HRV-10, HRV-11 |
| Source หลัง firewall | Agent → EDC | Remote harvester agent ติดตั้งใกล้ source ส่ง metadata ออกทางเดียว (outbound) | HRV-12 |

หลักการ: EDC เก็บเฉพาะ metadata; Lakehouse ยังเป็นที่เดียวที่เก็บและประมวลผลข้อมูลจริง และเป็นผู้บังคับใช้สิทธิ์

## 5. ความต้องการเชิงฟังก์ชัน

ความต้องการแบ่งเป็น 14 กลุ่มตามความสามารถมาตรฐานของ Enterprise Data Catalog ระดับความสำคัญ: **M** = Must, **S** = Should, **C** = Could

### 5.1 Metadata Harvesting จาก Lakehouse (HRV)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| HRV-01 | Connector อ่าน metastore ของ Lakehouse: catalog / schema / table / view / column, data type, partition, table format (Apache Iceberg: schema evolution, partition spec, snapshot), location, owner เชิงเทคนิค | M |
| HRV-02 | ตั้งเวลา harvest ได้ (schedule) และรองรับ incremental sync; รับ event เมื่อมี DDL change ถ้า Lakehouse ส่งได้ | M |
| HRV-03 | ตรวจจับ schema change (เพิ่ม/ลบ/เปลี่ยนชนิด column) เก็บเป็นเวอร์ชัน และแจ้ง Owner/Steward ของ asset ที่กระทบ | M |
| HRV-04 | Asset ที่ถูกลบใน Lakehouse เปลี่ยนสถานะเป็น Deprecated โดยไม่ลบ business metadata ทิ้ง | M |
| HRV-05 | เก็บ operational metadata: จำนวนแถว, ขนาด, เวลาอัปเดตล่าสุด (freshness), snapshot/version ของ table | M |
| HRV-06 | Data Profiling แบบสุ่มตัวอย่างผ่าน Trino: null %, distinct, min/max, pattern โดยไม่เก็บข้อมูลจริงไว้ใน EDC | S |
| HRV-07 | Harvest จากแหล่งเสริม: BI tool (dashboard/report), notebook, dbt model, ML feature table | S |
| HRV-08 | หน้าจอจัดการ connector: credential (เก็บใน secret store), include/exclude pattern, ประวัติการ run, error log | M |
| HRV-09 | Connector SDK แบบเปิด เพื่อเพิ่มแหล่ง metadata ใหม่โดยไม่แก้ core | C |

แหล่งข้อมูลนอก Lakehouse:

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| HRV-10 | Connector สำเร็จรูปสำหรับ Database (PostgreSQL, MySQL, SQL Server, Oracle) และ Cloud Data Platform (Snowflake, BigQuery, Redshift, Databricks, Azure Synapse) — รายการแรกต้องยืนยันตามลูกค้า | M |
| HRV-11 | ทุก source ใช้ metamodel เดียวกัน; lineage ข้าม platform เชื่อมกันได้ (เช่น Oracle → Iceberg → report) ด้วย dataset identifier ตาม OpenLineage naming | M |
| HRV-12 | Remote harvester agent สำหรับ source หลัง firewall หรือคนละ network กับ EDC (เชื่อมต่อแบบ outbound) | S |
| HRV-13 | Classification, glossary, ownership และ AI feature ใช้ได้กับ asset ทุก source เหมือนกัน; policy sync (ACC-03) เปิดต่อ source ที่มี API รองรับ | S |

### 5.2 Asset Catalog และ Business Metadata (CAT)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| CAT-01 | ประเภท asset: Database/Catalog, Schema, Table, View, Column, File/Volume, Pipeline/Job, Report/Dashboard, ML Model, Data Product | M |
| CAT-02 | Field มาตรฐานของ Dataset (อิง DCAT v3 + Dublin Core + บัญชีข้อมูล สพร.): ชื่อธุรกิจ TH/EN, คำอธิบาย, Domain, Owner, Steward, คำสำคัญ, วัตถุประสงค์, แหล่งที่มา, ความถี่การปรับปรุง, classification, ข้อจำกัดการใช้งาน, retention, ความคาดหวังด้านคุณภาพ | M |
| CAT-03 | Configurable Metamodel: Admin เพิ่ม custom attribute ต่อ asset type (ชนิด, บังคับ/ไม่บังคับ, ค่าที่อนุญาต) และ metamodel มีเวอร์ชัน | M |
| CAT-04 | แยก technical metadata (มาจาก harvest, แก้ใน EDC ไม่ได้) กับ business metadata (คนเติม) ชัดเจนบนหน้าจอ | M |
| CAT-05 | Critical Data Element (CDE) flag ระดับ column และ Critical flag ระดับ Dataset | M |
| CAT-06 | Completeness rule: asset ที่ Critical ต้องมี Owner, Steward, คำอธิบาย, classification ก่อน certify (อิง CDMC Control 2); เป็นหนึ่งในเงื่อนไขของ certification gate (CERT-01) | M |
| CAT-07 | Certification: สถานะ Draft → In Review → Certified → Deprecated; Certified ต้องผ่านการอนุมัติของ Owner; ติดป้าย Authoritative Source ได้ | M |
| CAT-08 | Bulk edit และ import/export business metadata ผ่าน Excel/CSV พร้อม validation preview และ diff ก่อน commit | M |
| CAT-09 | Domain และ Data Product: จัดกลุ่ม asset ตาม Domain, สร้าง Data Product (ชุด asset + owner + data contract + SLO + วิธีใช้); Data Product ทุกตัวต้องมี contract (CTR-01) และ SLO (DQ-06) ก่อน publish *(v1.1: S → M)* | M |
| CAT-10 | แนบเอกสารอ้างอิง, ตัวอย่าง query, ลิงก์ไปยังเครื่องมือใน Lakehouse (เปิดใน SQL editor) | S |

### 5.3 Business Glossary และมาตรฐานข้อมูล (GLO)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| GLO-01 | Term TH/EN, นิยาม, คำพ้อง, คำย่อ, Domain, Steward, สูตรคำนวณ (ถ้าเป็น KPI) | M |
| GLO-02 | โครงสร้างลำดับชั้นและความสัมพันธ์ (broader / narrower / related) | M |
| GLO-03 | สถานะการลงทะเบียนแบบ ISO/IEC 11179: Draft → Candidate → Approved → Retired พร้อม approval workflow | M |
| GLO-04 | ผูก term กับ column / dataset / report; แนะนำ term อัตโนมัติจากชื่อ column และคำอธิบาย | M |
| GLO-05 | Reference Data / Code List (เช่น ประเภทลูกค้า) พร้อม valid from/to | S |
| GLO-06 | Naming Convention rule (regex, prefix/suffix, คำย่อที่อนุญาต) ตรวจชื่อ table/column ที่ harvest มา และรายงานที่ผิด; สำหรับ asset ใหม่ใน Silver/Gold ผลตรวจ naming และ metadata completeness เป็น publish gate ก่อนเผยแพร่เป็น Data Product หรือ certify (asset เดิมรายงานอย่างเดียว) *(v1.1: S → M สำหรับ Silver/Gold ใหม่)* | M |
| GLO-07 | Impact analysis เมื่อแก้ term: แสดง asset ที่ผูกอยู่ | S |
| GLO-08 | Master Entity Registry: ทะเบียน entity หลัก (เช่น Customer, Contract) แหล่งออกรหัส และ mapping rule ระดับ metadata — เป็นฐานของ module MDM (หัวข้อ 5.14) | C |

### 5.4 Classification และ PDPA (CLS)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| CLS-01 | Classification scheme กำหนดได้ (ค่าเริ่มต้น: Public / Internal / Confidential / Restricted) พร้อมลำดับชั้น | M |
| CLS-02 | Auto-classification: สแกนชื่อ column + ตัวอย่างค่าด้วย rule/regex/ML และ LLM (AI-03) เพื่อตรวจจับ PII ไทย (เลขบัตรประชาชน 13 หลัก, เบอร์โทร, อีเมล, ที่อยู่, ชื่อ-สกุล, เลขบัญชี) | M |
| CLS-03 | ผลสแกนเป็น "ข้อเสนอ" พร้อม confidence; Steward ยืนยัน/ปฏิเสธ และระบบจำผลเพื่อไม่แนะนำซ้ำ | M |
| CLS-04 | PDPA tag: ข้อมูลส่วนบุคคล / ข้อมูลอ่อนไหว (ม.26) ระดับ column และสรุปขึ้นไประดับ dataset | M |
| CLS-05 | Tag propagation ตาม lineage: column ปลายทางที่มาจาก PII ได้รับ tag แนะนำตาม | S |
| CLS-06 | บันทึกวัตถุประสงค์การประมวลผล, ฐานทางกฎหมาย, retention ต่อ dataset ที่มี PII; export เป็นข้อมูลประกอบ RoPA (ม.39) | M |

### 5.5 Lineage และ Impact Analysis (LIN)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| LIN-01 | รับ runtime lineage จาก Spark job ผ่าน OpenLineage ที่ Lakehouse มีอยู่ (RunEvent / JobEvent / DatasetEvent) | M |
| LIN-02 | Parse SQL ของ Trino view / query เพื่อสร้าง lineage เมื่อไม่มี event | S |
| LIN-03 | Lineage ระดับ table และ column (OpenLineage `columnLineage`, DIRECT / INDIRECT) | M (table) / S (column) |
| LIN-04 | แสดง lineage จากแหล่งต้นทาง → Bronze → Silver → Gold → Report พร้อม overlay: owner, classification, DQ score, freshness | M |
| LIN-05 | Impact analysis: downstream ที่ได้รับผลกระทบจาก schema change และรายชื่อ Owner ที่ต้องแจ้ง | M |
| LIN-06 | Sync manual lineage ที่สร้างใน Lakehouse และสร้าง/แก้ manual lineage ใน EDC ได้ รวมระบบนอก Lakehouse (เช่น ERP ต้นทาง, ไฟล์ Excel) | S |

### 5.6 Data Quality และ Observability (DQ)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| DQ-01 | DQ Rule Register: ผูก rule กับ dataset/column, มิติคุณภาพ (DMBOK: Accuracy, Completeness, Validity, Consistency, Uniqueness, Timeliness ฯลฯ), threshold, severity, owner | M |
| DQ-02 | Rule มี 2 ชั้น: คำอธิบายธุรกิจ + technical definition เป็น Great Expectations expectation suite ที่ DQ engine (GX + PySpark) ดึงไปรันผ่าน API; นำเข้า suite ที่มีอยู่แล้วได้ | M |
| DQ-03 | รับ validation result ของ Great Expectations จาก PySpark run (API, OpenLineage `dataQualityAssertions`) และแสดง DQ score / trend ต่อ asset | M |
| DQ-04 | Freshness SLA: กำหนดความสดใหม่ที่คาดหวังต่อ asset และแจ้งเตือนเมื่อเกิน; ใช้เป็น SLO ด้าน freshness ของ DQ-06 *(v1.1: S → M)* | M |
| DQ-05 | DQ ไม่ผ่าน หรือ SLO/contract ถูกละเมิด → สร้าง Data Issue อัตโนมัติ (ตาม severity ที่กำหนดใน OBS-04) และแสดงคำเตือนบนหน้า asset และบน lineage ปลายทาง *(v1.1: S → M)* | M |
| DQ-06 | SLO ต่อ Data Product หลายมิติ: freshness, completeness ของ CDE, volume (ช่วงที่ยอมรับเทียบ median 30 วัน), DQ score ขั้นต่ำ และ availability; คำนวณ % attainment ราย 30 วัน สถานะ met/breached และ error budget คงเหลือ (เช่น SLO 99.5% = budget 0.5% ต่อ 30 วัน); budget หมด → แจ้ง Owner และระงับการเปลี่ยน contract แบบ non-urgent จนกว่าจะฟื้นตัว *(ใหม่ v1.1)* | M |
| DQ-07 | สูตร DQ score: score ของ asset = Σ(pass rate ของ rule × น้ำหนักมิติ × น้ำหนัก severity) ÷ Σ(น้ำหนัก); ค่าเริ่มต้น severity High = 3, Medium = 2, Low = 1; rule บน CDE คูณ 2; น้ำหนักมิติตั้งค่าได้ต่อ Domain (ค่าเริ่มต้นเท่ากัน); แสดงสูตรและส่วนประกอบของคะแนนบนหน้า asset *(ใหม่ v1.1)* | M |

#### 5.6.1 Data Contract (CTR) — ใหม่ใน v1.1

Data contract คือข้อตกลงที่กำหนดคุณภาพไว้ล่วงหน้าระหว่างผู้ผลิต (producer) และผู้ใช้ (consumer) ข้อมูล EDC เป็น source of truth ของ contract ส่วน pipeline ใน Lakehouse เป็นผู้บังคับใช้

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| CTR-01 | กำหนด contract ต่อ Data Product หรือ dataset ตามโครงสร้าง Open Data Contract Standard (ODCS): schema (column, ชนิด, required, key), semantics (นิยาม, grain, ผูก glossary term), DQ rule (อ้าง DQ-01), SLA/SLO (DQ-06), classification/PII (CLS) และ Owner/Steward; นำเข้าและส่งออกเป็น YAML ได้ | M |
| CTR-02 | Contract มีเวอร์ชันแบบ semver (major = breaking, minor = เพิ่มแบบเข้ากันได้, patch = แก้คำอธิบาย) เก็บประวัติและ diff ระหว่างเวอร์ชัน; การออกเวอร์ชันใหม่ต้องผ่าน workflow อนุมัติร่วม producer (Owner) และ consumer ที่ subscribe (WF) | M |
| CTR-03 | เมื่อ harvest พบ schema change (HRV-03) ให้เทียบกับ contract และจัดเป็น breaking (ลบ column, เปลี่ยนชนิดแบบไม่เข้ากัน, เปลี่ยน grain/key, required → ไม่มี) หรือ non-breaking (เพิ่ม column nullable, ขยายคำอธิบาย); breaking → contract สถานะ Violated, สร้าง incident/Data Issue และแจ้ง consumer ที่ subscribe ผ่าน impact analysis (LIN-05) | M |
| CTR-04 | Export contract เป็น Great Expectations expectation suite และผ่าน API ให้ pipeline ใช้เป็น gate ตอน ingest/publish: ไม่ผ่าน → block หรือส่งไป quarantine ตามที่ตั้งค่าใน contract; ผลส่งกลับผ่าน DQ-03 | M |
| CTR-05 | หน้า Contract บน asset/Data Product แสดง schema ที่คาดหวังเทียบของจริง, สถานะ Compliant/Violated, ประวัติเวอร์ชันและ diff, รายชื่อ consumer และผลกระทบ; ป้าย schema change บนหน้าแรกระบุว่าผิดสัญญาหรือไม่ | M |
| CTR-06 | Consumer subscribe contract ได้ และเสนอ change request ต่อ contract จาก feedback/rating ได้ | S |

#### 5.6.2 Certification Gate (CERT) — ใหม่ใน v1.1

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| CERT-01 | Certify (CAT-07) ได้เมื่อผ่านทุกเงื่อนไข: completeness rule (CAT-06), naming (GLO-06 สำหรับ Silver/Gold ใหม่), DQ score ≥ threshold ของ Domain (DQ-07), CDE rule coverage 100%, contract compliant (CTR-03), SLO met ในรอบ 30 วัน (DQ-06) และ PII ยืนยันแล้ว (CLS); หน้าขอ certify แสดง checklist ผ่าน/ไม่ผ่านพร้อมหลักฐาน และปิดปุ่มอนุมัติเมื่อมีข้อไม่ผ่าน | M |
| CERT-02 | Auto-decertify: DQ score ต่ำกว่า threshold ต่อเนื่อง N run (ค่าเริ่มต้น 3) หรือ contract Violated เกิน X วัน (ค่าเริ่มต้น 7) → ระบบ flag "At risk" แจ้ง Owner/Steward และถอน Certified อัตโนมัติพร้อมบันทึก audit | M |
| CERT-03 | ป้าย Certified แสดง tooltip เกณฑ์ที่ใช้และวันที่ประเมินล่าสุด | S |

#### 5.6.3 Observability (OBS) — ใหม่ใน v1.1

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| OBS-01 | Anomaly detection จาก operational metadata (HRV-05) และ profiling (HRV-06): volume (row count นอกช่วง เช่น > 3σ หรือ ±X% ของ median), schema (เทียบ contract), distribution (mean/null %/PSI ของ column สำคัญ) | M |
| OBS-02 | Pipeline run health จาก OpenLineage RunEvent (START/COMPLETE/FAIL): success rate, duration p95, run ที่ fail ต่อเนื่อง และผูกกับ asset ปลายทางบน lineage | M |
| OBS-03 | Incident timeline ต่อ asset/Domain รวม anomaly, contract violation, SLO breach และ pipeline fail; สถานะ Open/Acknowledged/Resolved/Muted; วัด MTTD/MTTR | M |
| OBS-04 | Alert routing ตาม Owner/Steward/on-call ของ asset หรือ Domain, กำหนด severity, ช่องทาง (email, Teams, LINE, webhook/PagerDuty), escalation เมื่อไม่ acknowledge, และ dedup/grouping ตามช่วงเวลา | M |
| OBS-05 | Mute และ maintenance window ต่อ asset/connector; alert ในช่วงนี้บันทึกแต่ไม่แจ้ง | S |

### 5.7 Access Governance และ Policy (ACC)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| ACC-01 | Access Request: ผู้ขอเลือก asset, ระบุวัตถุประสงค์ (CDMC Control 8) และระยะเวลา; ส่งอนุมัติตาม Owner + classification (ข้อมูลอ่อนไหวผ่าน DPO) | M |
| ACC-02 | เมื่ออนุมัติ ส่ง grant ไปยัง Lakehouse ผ่าน API (เช่น role/policy ใน access control ของ Lakehouse) และถอนสิทธิ์อัตโนมัติเมื่อหมดอายุ | M |
| ACC-03 | Policy sync: ส่ง classification / PII tag ไปเป็น tag ใน Lakehouse เพื่อให้ masking / row filter ทำงานตาม tag | S |
| ACC-04 | แสดง "ใครเข้าถึงได้บ้าง" ต่อ asset (อ่าน grant จาก Lakehouse) และรอบทบทวนสิทธิ์ (access review) | S |
| ACC-05 | Policy Register: นโยบายด้านข้อมูล (เวอร์ชัน, สถานะรับรอง, วันที่มีผล) ผูกกับ classification, rule และ asset | S |

### 5.8 Governance Workflow (WF)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| WF-01 | Workflow engine กำหนดขั้นตอนได้ (ไม่ hard-code) ขับด้วย RACI ที่นำเข้าจาก Excel | M |
| WF-02 | ประเภท workflow: Certification, Glossary approval, Access Request, Change Request (definition / owner / classification), Data Issue | M |
| WF-03 | Data Issue: แจ้งปัญหา, มอบหมาย, root cause, corrective action, ปิด (วงจร PDCA ตาม ISO 8000-61) | M |
| WF-04 | Inbox งานรออนุมัติ, SLA, แจ้งเตือน email / in-app, escalate เมื่อเกิน SLA | M |
| WF-05 | เชื่อมกับระบบภายนอกผ่าน webhook (เช่น ITSM, LINE, MS Teams) | C |
| WF-06 | Quality review รายเดือนต่อ Domain (PDCA): สรุป KPI คุณภาพ (2.3), SLO breach, contract violation และ issue ค้าง; มอบหมาย action และติดตามในรอบถัดไป; feedback/rating ต่ำจาก consumer ส่งต่อเป็นข้อเสนอ rule หรือ contract change *(ใหม่ v1.1)* | M |

### 5.9 Search, Discovery และ Collaboration (SRC)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| SRC-01 | Full-text search ไทย/อังกฤษ (ตัดคำไทย) ค้นจากชื่อ, คำอธิบาย, glossary term, column, tag | M |
| SRC-02 | Facet filter: Domain, asset type, Owner, classification, Certified, PII, freshness | M |
| SRC-03 | Ranking ให้ Certified และ asset ที่ใช้งานมาก (จาก query log ของ Lakehouse) ขึ้นก่อน | S |
| SRC-04 | ผลค้นหาซ่อน asset ที่ผู้ใช้ไม่มีสิทธิ์เห็น metadata ตาม classification | M |
| SRC-05 | Comment, Q&A, rating, follow asset เพื่อรับแจ้งเตือนเมื่อมีการเปลี่ยนแปลง | S |
| SRC-06 | ค้นหาด้วยภาษาธรรมชาติไทย/อังกฤษ — ดู AI-01 | C |

### 5.10 Audit และ Governance Reporting (AUD)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| AUD-01 | Audit trail แบบ append-only ทุกการเปลี่ยนแปลง metadata และการอนุมัติ (ใคร อะไร เมื่อไร ค่าเดิม/ใหม่ เหตุผล) | M |
| AUD-02 | Governance dashboard: coverage ตามตัวชี้วัดในหัวข้อ 2.3 แยกตาม Domain, งานค้าง, PII ที่ยังไม่ยืนยัน | M |
| AUD-03 | Export รายงาน: Data Dictionary (Excel / Word / PDF ภาษาไทย), รายงาน audit สำหรับ Auditor | M |
| AUD-04 | Tamper-evident log (เช่น hash chain) | S |

### 5.11 API และ Interoperability (API)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| API-01 | REST API (OpenAPI 3) ครอบคลุม asset, glossary, classification, lineage, DQ result, workflow | M |
| API-02 | Endpoint รับ OpenLineage event และผล DQ จาก Lakehouse | M |
| API-03 | Export มาตรฐานเปิด: DCAT v3 JSON-LD, CSV, OpenLineage JSON เพื่อไม่ผูกขาดกับผู้ขาย | S |
| API-04 | Event stream เมื่อ metadata เปลี่ยน (webhook / message queue) ให้ระบบอื่น subscribe | S |
| API-05 | Extension point สำหรับ module เพิ่มเติม (เช่น MDM) และ module เฉพาะลูกค้า (custom asset type, custom workflow, custom page) | S |

### 5.12 AI Assistant ด้วย LLM (AI)

AI ทำหน้าที่ร่างและอธิบาย คนเป็นผู้อนุมัติทุกครั้งก่อนมีผลใน catalog

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| AI-01 | **Search & Q&A:** ถามตอบภาษาธรรมชาติ (EN/TH) ตอบจาก metadata ที่ผู้ใช้มีสิทธิ์เท่านั้น พร้อมลิงก์ไปยัง asset ที่อ้างอิง | M |
| AI-02 | **Generate:** ร่างคำอธิบาย table/column, glossary term, tag และ business name จาก schema + profiling + lineage | M |
| AI-03 | **Detect:** ตรวจจับ PII / ข้อมูลอ่อนไหวและเสนอ classification ร่วมกับ rule (CLS-02) พร้อมเหตุผลและ confidence | M |
| AI-04 | **Validate:** ตรวจคุณภาพ metadata — คำอธิบายขัดกับข้อมูลจริง, term ซ้ำหรือนิยามขัดกัน, naming ผิด convention, field บังคับขาด | S |
| AI-05 | **Discover:** แนะนำ asset ที่คล้ายหรือซ้ำซ้อน, join key, glossary mapping, candidate CDE และ Authoritative Source | S |
| AI-06 | **Explain:** อธิบาย lineage, impact analysis, ผล validation ของ Great Expectations และ schema change เป็นภาษาธุรกิจ | M |
| AI-07 | **Suggest DQ rules:** เสนอ GX expectation จาก profiling และ glossary; Steward อนุมัติก่อนส่งให้ DQ engine | S |
| AI-08 | **Human-in-the-loop:** ผลจาก AI ติดป้าย "AI-generated" มีสถานะ Suggested → Accepted / Edited / Rejected; บันทึก audit (model, prompt version, ผู้อนุมัติ) | M |
| AI-09 | **Model provider:** ตั้งค่า LLM ได้ทั้ง on-prem / private (OpenAI-compatible API) และ cloud; เลือก model แยกตาม feature | M |
| AI-10 | **Privacy guard:** ค่าเริ่มต้นส่งเฉพาะ metadata ให้ LLM; sample data ส่งได้เมื่อ Admin เปิดและ mask PII ก่อน; asset ระดับ Restricted ส่งได้เฉพาะ model on-prem | M |
| AI-11 | **Batch mode:** รัน generate / detect ทั้ง namespace ตามคิว แล้วให้ Steward review แบบ bulk | S |

#### 5.12.1 Ask Softnix — AI Chatbot ผู้เชี่ยวชาญ Data Catalog

Ask Softnix คือหน้าต่างเดียวของ AI ทั้งหมดในหัวข้อ 5.12: แสดงอยู่ทุกหน้า ตอบคำถามการใช้งาน ช่วยบันทึกค่าและจัดการงาน ผ่านทั้ง text และ voice

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| ASK-01 | **Always-on:** ปุ่มลอยสัญลักษณ์ Ask Softnix แสดงทุกหน้า; เปิดเป็น side panel ที่ไม่บังงานหลัก; ย่อได้แต่ปุ่มยังอยู่; บทสนทนาคงอยู่เมื่อเปลี่ยนหน้า | M |
| ASK-02 | **Persona ผู้เชี่ยวชาญ:** ตอบวิธีใช้ระบบ, ความหมายของ field และสถานะ, ขั้นตอน workflow และแนวปฏิบัติ Data Governance (DAMA-DMBOK, PDPA) | M |
| ASK-03 | **Context-aware:** รู้หน้าที่ผู้ใช้อยู่, asset ที่เปิด, บทบาท และงานค้าง; แสดง suggested prompts ตามหน้า | M |
| ASK-04 | **ช่วยบันทึกค่าและจัดการ:** เช่น เติมคำอธิบาย, ตั้ง Owner, ติด tag, ยื่น access request, เปิด Data Issue; แสดงสิ่งที่จะเปลี่ยนให้ผู้ใช้ยืนยันก่อนบันทึกทุกครั้ง และทำได้เฉพาะตามสิทธิ์ผู้ใช้ | M |
| ASK-05 | **ตอบเรื่องข้อมูล:** ใช้ AI-01 ถึง AI-07 ในแชท (ค้น asset, อธิบาย lineage / DQ) ผ่าน MCP server ของ EDC เอง เพื่อใช้สิทธิ์ชุดเดียวกัน พร้อม deep link ไปยัง asset | M |
| ASK-06 | **Knowledge base:** ตอบจากคู่มือผู้ใช้, glossary, policy register และ release notes (RAG) พร้อมอ้างอิงหัวข้อ; Admin เพิ่มเอกสารขององค์กรได้ | M |
| ASK-07 | **Text chat:** แสดง Markdown, ตาราง, ลิงก์, ปุ่ม action; streaming, คัดลอกคำตอบ, ให้คะแนนคำตอบ | M |
| ASK-08 | **Voice:** กดค้างเพื่อพูด (push-to-talk), speech-to-text ไทย/อังกฤษ, อ่านคำตอบด้วย text-to-speech (เปิด/ปิดได้); แสดง transcript เสมอ; คำสั่งที่บันทึกข้อมูลต้องยืนยันด้วยการคลิก | M |
| ASK-09 | **ภาษา:** ตอบตามภาษาที่ผู้ใช้พิมพ์หรือพูด; ค่าเริ่มต้นตามภาษา UI (อังกฤษ) | M |
| ASK-10 | **ประวัติแชท:** เก็บต่อผู้ใช้ ผู้ใช้ลบได้; Admin กำหนดระยะเก็บ | S |
| ASK-11 | **ส่งต่อคน:** เมื่อตอบไม่ได้ เสนอส่งคำถามให้ Data Steward / Owner หรือเปิด Data Issue พร้อมแนบบทสนทนา | S |
| ASK-12 | **Governance:** audit ทุก action ที่ทำผ่าน Ask Softnix; Admin ปิด voice หรือ action mode ได้; เคารพ privacy guard (AI-10) | M |
| ASK-13 | **Accessibility:** shortcut เปิดด้วย keyboard, รองรับ screen reader, ปุ่มลอยไม่บัง action หลักบนจอเล็ก | S |

### 5.13 MCP Server (MCP)

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| MCP-01 | EDC เปิด MCP server (Streamable HTTP) ให้ AI agent และ LLM client ภายนอกใช้ catalog ได้ | M |
| MCP-02 | Tools อ่านขั้นต่ำ: `search_assets`, `get_asset`, `get_schema`, `get_lineage`, `get_glossary_term`, `get_dq_status`, `get_owners` | M |
| MCP-03 | Tools เขียน (เช่น `propose_description`, `create_issue`, `request_access`) สร้างเป็นข้อเสนอเข้า workflow เสมอ ไม่เขียนตรง | S |
| MCP-04 | Authentication OAuth 2.1 ผ่าน IdP เดียวกับ OIDC ผูกกับตัวผู้ใช้; ผลลัพธ์กรองตามสิทธิ์และ classification เหมือน UI | M |
| MCP-05 | Audit ทุกการเรียก tool (client, ผู้ใช้, tool, parameter) และกำหนด rate limit ต่อ client | M |
| MCP-06 | เปิด glossary และ data dictionary เป็น MCP resources พร้อม prompt template มาตรฐาน | C |
| MCP-07 | AI Assistant ภายใน EDC เป็น MCP client เรียก MCP server อื่นได้ (เช่น ของ Lakehouse) | C |

### 5.14 รองรับ Module MDM ในอนาคต (MDM)

เฟสนี้ไม่สร้าง MDM แต่ออกแบบ core ให้ module MDM ต่อเพิ่มได้โดยไม่แก้โครงสร้างเดิม

| ID | ความต้องการ | Pri |
| --- | --- | --- |
| MDM-01 | Data model มี Master Entity, Attribute, Identifier และ Source System Mapping เป็นวัตถุชั้นหนึ่ง (ขยายจาก GLO-08) | M |
| MDM-02 | Metamodel รองรับ asset type ใหม่ เช่น Golden Record Set, Match Rule, Survivorship Rule ผ่าน configuration | M |
| MDM-03 | Lineage รองรับ node ประเภท MDM process (match / merge) ผ่าน OpenLineage | S |
| MDM-04 | Workflow engine รองรับ stewardship task ของ MDM (review match, approve merge) | S |
| MDM-05 | Publish event เมื่อนิยาม master entity เปลี่ยน ให้ module MDM subscribe ได้ (API-04) | S |
| MDM-06 | Master data ใช้ classification, access policy, glossary และ audit ชุดเดียวกับ EDC | M |

## 6. ความต้องการที่ไม่ใช่ฟังก์ชัน

ค่าตัวเลขเป็นสมมติฐานสำหรับการออกแบบ ต้องยืนยันกับขนาด Lakehouse และนโยบาย IT ของลูกค้า

| ID | หมวด | ความต้องการ |
| --- | --- | --- |
| NFR-01 | Security | Authentication ผ่าน OpenID Connect (OIDC) กับ IdP ขององค์กร, map group/claim → บทบาท, ไม่เก็บรหัสผ่านใน EDC, MFA สำหรับ Admin, RBAC + ABAC ตาม classification |
| NFR-02 | Security | TLS 1.2+, เข้ารหัสข้อมูลที่จัดเก็บ, credential connector อยู่ใน secret store |
| NFR-03 | Data minimization | EDC เก็บ metadata เท่านั้น; sample data ปิดเป็นค่าเริ่มต้น และ mask PII เมื่อเปิดใช้ |
| NFR-04 | Least privilege | Service account ที่ harvest ใช้สิทธิ์อ่าน metadata และสิทธิ์สุ่มตัวอย่างที่จำกัดเท่านั้น |
| NFR-05 | Performance | ค้นหา ≤ 2 วินาที (p95) ที่ 100,000 asset / 1,000,000 column, ผู้ใช้พร้อมกัน 200 คน |
| NFR-06 | Performance | Harvest แบบ incremental 10,000 table เสร็จใน ≤ 15 นาที; lineage graph 5 ชั้น / 500 node แสดง ≤ 3 วินาที |
| NFR-07 | Impact on Lakehouse | Profiling และ harvest กำหนด resource quota / ช่วงเวลาได้ ไม่รบกวน workload หลัก |
| NFR-08 | Availability | 99.5% ในเวลาทำการ; RPO ≤ 24 ชม., RTO ≤ 8 ชม.; EDC ล่มต้องไม่กระทบการทำงานของ Lakehouse |
| NFR-09 | Deployment | On-premise และ Private Cloud บน Kubernetes; ติดตั้งแยกจาก Lakehouse เป็น standalone (ไม่แชร์ database หรือ compute); Lakehouse ล่มแล้ว EDC ยังค้นหา metadata ล่าสุดได้ |
| NFR-10 | ภาษา | Web app; UI ภาษาอังกฤษเป็นค่าเริ่มต้น สลับเป็นไทยได้ต่อผู้ใช้; business metadata เก็บได้ 2 ภาษา, ตัดคำไทยในการค้นหา, ฟอนต์ไทยใน PDF, เลือก พ.ศ./ค.ศ. ได้ |
| NFR-11 | Audit retention | เก็บ audit log ≥ 5 ปี หรือตามนโยบายลูกค้า |
| NFR-12 | Maintainability | Metamodel, workflow, classification ปรับด้วย configuration ไม่ต้อง deploy code ใหม่ |
| NFR-13 | Multi-tenancy | แยกขอบเขตตามบริษัทในกลุ่ม / Domain ได้ใน instance เดียว |

เพิ่มเติมสำหรับ Web app, AI และ MCP:

| ID | หมวด | ความต้องการ |
| --- | --- | --- |
| NFR-14 | Web app | รองรับ Chrome, Edge, Safari, Firefox รุ่นล่าสุด 2 เวอร์ชัน; ไม่ต้องติดตั้ง client; responsive สำหรับ tablet |
| NFR-15 | i18n | ข้อความ UI ทั้งหมดอยู่ในไฟล์แปล (EN, TH) เพิ่มภาษาได้โดยไม่แก้ code; AI ตอบตามภาษาที่ผู้ใช้เลือก |
| NFR-16 | AI availability | EDC ทำงานได้ครบเมื่อ LLM ไม่พร้อม (AI เป็น feature เสริม); Ask Softnix แจ้งสถานะไม่พร้อมแทนการหายไป; เปิด/ปิดแต่ละ AI feature ได้ |
| NFR-17 | AI performance | คำตอบ Ask Softnix เริ่ม stream ≤ 3 วินาที; generate คำอธิบาย 1 table ≤ 15 วินาที (ขึ้นกับ model) |
| NFR-18 | AI cost control | กำหนด quota token ต่อผู้ใช้ / feature และรายงานการใช้งาน |
| NFR-19 | MCP security | MCP ใช้ TLS + OAuth 2.1, ปิดได้ทั้ง server, กำหนด allowlist client |
| NFR-20 | Voice performance | Transcript แสดงภายใน ≤ 1.5 วินาทีหลังหยุดพูด; ความแม่นยำภาษาไทยและศัพท์เทคนิค (ชื่อ table, term) ปรับด้วย custom vocabulary จาก glossary |
| NFR-21 | Voice privacy | เสียงไม่ถูกเก็บหลังแปลงเป็นข้อความ (เก็บเฉพาะ transcript); เลือก STT/TTS engine แบบ on-prem ได้; ขอสิทธิ์ microphone ตาม browser |

## 7. มาตรฐานอ้างอิง

มาตรฐานชุดเดิมจาก PRD v0.1 ยังใช้ได้ แต่ผูกกับกลุ่มความต้องการใหม่แทน TOR

| มาตรฐาน | ใช้กำหนดอะไรใน EDC | กลุ่มความต้องการ |
| --- | --- | --- |
| DAMA-DMBOK2 | บทบาท Owner / Steward / Custodian, CDE, มิติคุณภาพข้อมูล | หัวข้อ 3, CAT, DQ |
| ISO/IEC 11179 | โครงสร้าง Data Element / Value Domain, สถานะการลงทะเบียน term | GLO |
| ISO 8000-8 / 8000-61 | ประเภทคุณภาพ (syntactic / semantic / pragmatic), วงจร PDCA ของ Data Issue | DQ, WF-03 |
| W3C DCAT v3 + Dublin Core | Field มาตรฐานของ Dataset และรูปแบบ export | CAT-02, API-03 |
| OpenLineage | Object model Run / Job / Dataset, facet ของ column lineage และ DQ, RunEvent สำหรับ pipeline health | LIN, DQ-03, OBS-02 |
| Open Data Contract Standard (ODCS, Bitol / Linux Foundation) | โครงสร้าง data contract: schema, quality, SLA, roles | CTR |
| EDM Council CDMC | Ownership บังคับ (C2), Authoritative Source (C3), Cataloging (C5), Classification (C6), Access (C7), Purpose (C8), Lineage (C14) | CAT, CLS, ACC, LIN |
| มรด. 3-1:2565 / 6:2566 (สพร.) | Metadata บัญชีข้อมูล 14 รายการ และคำศัพท์ภาษาไทย (ใช้เป็น profile เลือกได้ สำหรับหน่วยงานรัฐและรัฐวิสาหกิจ) | CAT-02, CLS-01 |
| PDPA พ.ศ. 2562 | ม.26 ข้อมูลอ่อนไหว, ม.37 มาตรการความมั่นคงปลอดภัย, ม.39 RoPA | CLS-04, CLS-06, ACC |

มาตรฐานเทคนิคที่เพิ่มตาม stack ของ Lakehouse:

| มาตรฐาน | ใช้กำหนดอะไรใน EDC | กลุ่มความต้องการ |
| --- | --- | --- |
| Apache Iceberg table spec + REST catalog | การอ่าน schema, partition, snapshot | HRV |
| Great Expectations (expectation suite, validation result) | รูปแบบ rule และผล DQ ที่แลกเปลี่ยนกับ DQ engine | DQ, AI-07 |
| Model Context Protocol (MCP) | Interface ให้ AI agent เข้าถึง catalog | MCP |

แหล่งอ้างอิงและการตีความรายละเอียดยังคงอยู่ใน PRD v0.1 หัวข้อ 2 และ 17.2

## 8. Roadmap ความเสี่ยง และคำถามเปิด

แบ่งเป็น 3 เฟส แต่ละเฟสผ่าน gate ที่วัดได้ก่อนไปต่อ ระยะเวลาแต่ละเฟสยังต้องกำหนด

&#91;embedded content: Roadmap · 3 เฟส, 3 gate\]

Module เฉพาะลูกค้าพัฒนาคู่ขนานบน Extension point (API-05) โดยไม่แก้ core

### 8.1 สิ่งที่เปลี่ยนจาก PRD v0.1

| หัวข้อใน v0.1 | ในฉบับนี้ |
| --- | --- |
| FR-CAT, FR-STD (Catalog, Glossary, Classification, Naming) | คงไว้ ปรับให้ harvest จาก Lakehouse แทนการกรอกด้วยมือ → HRV, CAT, GLO, CLS |
| FR-LIN, FR-DQ, FR-GOV, FR-AUD-01 | คงไว้ → LIN, DQ, WF, ACC, AUD |
| FR-IMP (Import เอกสารที่ปรึกษา Word/Excel) | ลดเป็น bulk import/export business metadata (CAT-08) |
| FR-XWK (Crosswalk ราย record) | เหลือ Master Entity Registry (GLO-08) + โครงสร้างรองรับ module MDM (MDM-01 ถึง MDM-06); mapping ราย record ย้ายไป module MDM |
| FR-SOT (SSOT Register) | รวมเป็น Authoritative Source badge ใน Certification (CAT-07) |
| FR-GATE, FR-EXC, FR-CAL, FR-AUD-02 (Close Cycle) | ย้ายไป Extension รายลูกค้า |
| FR-MDL, FR-TSC, FR-CMP, FR-POL-02 (งานตาม TOR) | ย้ายไป Extension รายลูกค้า |

### 8.2 ความเสี่ยง

| ความเสี่ยง | ผลกระทบ | แนวทางรับมือ |
| --- | --- | --- |
| Spark job บางตัวไม่มี OpenLineage หรือ lineage ผ่าน Trino view ไม่ถูกจับ | Lineage ไม่ครบ | Parse SQL ของ Trino (LIN-02), manual lineage (LIN-06) |
| Profiling ผ่าน Trino แย่ง resource กับ workload หลัก | Lakehouse ช้าลง | Resource group, ช่วงเวลา, sampling (NFR-07) |
| Steward ไม่เติม business metadata | Catalog มีแต่ชื่อตาราง | AI ร่างให้ก่อน (AI-02, AI-11), completeness rule, dashboard ตาม Domain |
| LLM สร้างคำอธิบายผิดหรือแต่งเติม (hallucination) | Metadata ผิดและคนเชื่อถือ | Human-in-the-loop (AI-08), อ้างอิงที่มา, ป้าย AI-generated |
| Metadata หรือ sample รั่วไป LLM ภายนอก | เสี่ยง PDPA | Privacy guard (AI-10), on-prem model สำหรับข้อมูล Restricted |
| MCP เปิดทางให้ agent เห็นข้อมูลเกินสิทธิ์ | ข้อมูลรั่ว | กรองสิทธิ์เดียวกับ UI (MCP-04), audit + rate limit (MCP-05) |
| Auto-classification ผิดพลาด | PII หลุดหรือแจ้งเตือนเกิน | ให้คนยืนยันก่อนมีผล (CLS-03) |
| Tag / grant ใน EDC กับ Lakehouse ไม่ตรงกัน | สิทธิ์จริงต่างจากที่แสดง | กำหนด source of truth ต่อประเภท + reconcile job รายวัน |

### 8.3 คำถามเปิด

- [ ] Iceberg ใช้ catalog แบบใด (REST / Hive Metastore / Nessie / JDBC) — กำหนดวิธี harvest
- [ ] OpenLineage ปัจจุบันส่ง event ไป backend ใด และ manual lineage เก็บที่ไหน — EDC จะเป็น source of truth ของ lineage หรือ sync จาก backend เดิม
- [ ] DQ engine (GX + PySpark) รับ expectation suite จากภายนอกทางใด และส่ง validation result ออกมาในรูปแบบใด
- [ ] Lakehouse มี API จัดการ role / tag / masking หรือยัง (เช่น Trino access control, Apache Ranger)
- [ ] LLM ที่จะใช้: on-prem (model, GPU) หรือ cloud API และข้อจำกัด PDPA ในการส่ง metadata ออกนอกองค์กร; STT/TTS engine ภาษาไทยสำหรับ Ask Softnix; สัญลักษณ์และบุคลิกของ Ask Softnix (brand guideline)
- [ ] MCP client ที่ต้องรองรับเป็นอันดับแรก และต้องเปิด tools เขียนตั้งแต่เฟสแรกหรือไม่
- [ ] ขอบเขตและกำหนดการของ module MDM
- [ ] ระยะเวลาและทีมของแต่ละเฟส
- [ ] IdP ที่ใช้กับ OIDC และ claim ที่จะ map เป็นบทบาท; Database / Cloud Data Platform ใดต้องรองรับก่อน
