# การยืนยันตัวตน (Authorization)

> **Branch:** เอกสารนี้ใช้ได้เฉพาะสำหรับ branch `auth` เท่านั้น

&nbsp;

## การเลือกแนวทาง

### ทำไมถึงใช้ JWT access + refresh ใน HttpOnly cookies

มีแนวทางเชิงสถาปัตยกรรมสำหรับการยืนยันตัวตนอยู่หลายแบบ เราเลือก **JWT access token (15 นาที) + refresh token พร้อม rotation ฝั่งเซิร์ฟเวอร์ (PostgreSQL)**

| แนวทาง                                             | เหมาะเมื่อใด                                      | ทำไมถึงไม่เลือก                                                      |
| -------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| **Session cookie** (nuxt-auth-utils, iron-session) | Monolith, แอปเรียบง่าย, ไม่ต้องการ logout บนทุกอุปกรณ์ | ไม่สามารถเพิกถอน session ได้ทันที, ไม่มีประวัติอุปกรณ์, ไม่มี reuse detection |
| **Stateless JWT ล้วน ๆ**                            | Microservices, service-to-service, TTL สั้นมาก    | JWT ไม่สามารถ invalidate ได้ — token ที่ถูกขโมยยังใช้ได้จนกว่าจะหมดอายุ    |
| **Managed auth** (Clerk, Auth0)                    | Startup, ไม่มีข้อกำหนดเรื่องการเก็บข้อมูล                | Dependency ภายนอก, ข้อมูลไปอยู่กับบุคคลที่สาม, ราคาเมื่อ scale             |
| **OAuth / OIDC** (Keycloak, Google)                | B2B SaaS, corporate SSO                         | เกินความจำเป็นสำหรับ template; สามารถเพิ่มทับบนโซลูชันปัจจุบันได้              |
| **JWT access + refresh ฝั่งเซิร์ฟเวอร์** ← ตัวเลือกของเรา | Nuxt/Next + API แยก, ต้องการความปลอดภัยเต็มรูปแบบ   | —                                                                |

### ทำไมถึงไม่ใช้ stateless JWT

Stateless JWT ไม่ต้องเรียกที่เก็บ session ในทุก request — token เป็นข้อมูลที่สมบูรณ์ในตัวเอง แต่มันมีข้อจำกัดพื้นฐาน: **ไม่สามารถ invalidate token ก่อนกำหนดได้** หาก token ถูกขโมยหรือผู้ใช้เปลี่ยนรหัสผ่าน — token จะยังใช้ได้จนกว่าจะหมด TTL

ทางออกเดียวคือ blacklist ใน Redis ซึ่งในทางปฏิบัติทำให้ JWT กลายเป็น stateful แต่ซับซ้อนกว่า

### ทำไมถึงไม่ใช้ session cookie

Session cookie (ทั้ง session ถูกเข้ารหัสไว้ใน cookie โดยไม่มีที่เก็บฝั่งเซิร์ฟเวอร์) เป็นโซลูชันที่เรียบง่าย แต่ไม่ให้:

- Logout แบบบังคับ: ไม่สามารถ "เพิกถอน" cookie ที่อยู่ที่ client แล้วได้
- ประวัติอุปกรณ์: ไม่มีทะเบียน session — ไม่มีอะไรให้แสดง
- Reuse detection: หากไม่มีการบันทึกฝั่งเซิร์ฟเวอร์ ก็ไม่สามารถตรวจจับการใช้ token ซ้ำได้

### ตัวเลือกของเรา: hybrid

```
access_token  (JWT, 15 นาที)              — ตรวจสอบโดยไม่ต้องเรียกที่เก็บ session ในทุก request
refresh_token (ฝั่งเซิร์ฟเวอร์, 7 วัน)     — refresh access_token, ควบคุม session ได้เต็มที่
```

นี่คือ **มาตรฐานโดยพฤตินัย (de facto)** สำหรับเว็บแอปพลิเคชันที่มี backend แยก: สมดุลระหว่างประสิทธิภาพ (เรียกที่เก็บ session เพียงครั้งเดียวทุก 15 นาที) และความปลอดภัย (refresh สามารถเพิกถอนได้ทันที, reuse detection, ประวัติ session)

### ความแตกต่างจากแนวทางใน microservices

ในสถาปัตยกรรม microservices JWT ถูกใช้ต่างออกไป:

```
Browser → API Gateway → Service A (orders)
                      → Service B (payments)
                      → Service C (notifications)
```

Gateway ตรวจสอบ JWT ครั้งเดียวที่ทางเข้า แต่ละ service จะได้รับ request ที่ผ่านการ verify แล้ว Refresh-token อยู่ใน Auth Service ที่รวมศูนย์ ส่วน service ต่าง ๆ ไม่ยุ่งกับ session เลย — มันไม่ใช่ความรับผิดชอบของพวกมัน

ของเรามี backend เดียวที่จัดการทั้ง access และ refresh token เอง นี่เป็นสิ่งที่ถูกต้องสำหรับ monolith — การนำ pattern ของ microservices มาใช้ที่นี่จะเกินความจำเป็น
