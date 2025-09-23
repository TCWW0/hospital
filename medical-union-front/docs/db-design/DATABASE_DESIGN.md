# 医联体系统 - 数据库设计草案

本文档为基于前端页面与 mock API 的初始数据库设计建议，目标是为预约与远程医疗功能提供可靠的关系型数据模型（以 PostgreSQL 为例）。

## 设计原则
- 区分登录账户（users）与就诊人（patients），支持一个账户管理多个家庭成员。
- 使用 snapshot（JSONB）保存关键历史信息（如 patient_snapshot），防止后续更新覆盖历史记录。
- 排班表（schedules）以具体时隙为单位，支持容量管理与并发安全。
- 支付单独建表，支持第三方支付回调与对账。
- 附件建议使用对象存储（S3 等），数据库保存元数据与引用 URL。

---

## 关键实体

- users
  - id UUID PK
  - username varchar
  - password_hash varchar
  - role varchar ('patient','doctor','admin','staff')
  - profile JSONB
  - created_at timestamptz

- patients
  - id UUID PK
  - user_id UUID nullable
  - name varchar
  - gender varchar
  - dob date
  - relation varchar
  - phone varchar
  - id_number varchar
  - created_at
  - updated_at

- hospitals
  - id UUID PK
  - name varchar
  - address text
  - code varchar

- departments
  - id UUID PK
  - hospital_id UUID FK
  - name varchar

- doctors
  - id UUID PK
  - user_id UUID nullable
  - name varchar
  - title varchar
  - specialties JSONB
  - rating numeric
  - hospital_id UUID FK
  - department_id UUID FK
  - intro text
  - avatar_url varchar

- schedules
  - id UUID PK
  - doctor_id UUID FK
  - hospital_id UUID FK
  - department_id UUID FK
  - date date
  - start_time time
  - end_time time
  - slot_type varchar
  - capacity int
  - available int
  - created_at
  - updated_at
  - unique (doctor_id,date,start_time,end_time)

- appointments
  - id UUID PK
  - order_no varchar unique
  - patient_id UUID FK
  - patient_snapshot JSONB
  - doctor_id UUID FK
  - doctor_name varchar
  - hospital_id UUID FK
  - department_id UUID FK
  - schedule_id UUID FK nullable
  - date date
  - start_time time
  - end_time time
  - slot_type varchar
  - complaint text
  - status varchar
  - payment_status varchar
  - voucher_code varchar
  - created_at
  - updated_at

- telemedicine_applications
  - id UUID PK
  - application_no varchar unique
  - applicant_user_id UUID FK
  - patient_id UUID FK
  - patient_snapshot JSONB
  - preferred_method varchar
  - description text
  - attachments JSONB
  - status varchar
  - assigned_doctor_id UUID nullable
  - assigned_at timestamptz nullable
  - created_at timestamptz

- payments
  - id UUID PK
  - related_type varchar ('appointment','telemedicine')
  - related_id UUID
  - provider varchar
  - provider_trade_no varchar
  - amount numeric
  - currency varchar
  - status varchar
  - created_at

- attachments
  - id UUID PK
  - owner_type varchar
  - owner_id UUID
  - filename varchar
  - url varchar
  - content_type varchar
  - size int
  - created_at

---

## 索引建议
- appointments(doctor_id, date) -> 快速查询某医生某日预约
- appointments(patient_id) -> 患者历史查询
- schedules(doctor_id, date, start_time) -> 排班定位
- telemedicine_applications(status, created_at) -> 待处理队列
- doctors(hospital_id, department_id) -> 医生过滤

## 并发与事务建议
- 预约下单时，将关联 schedule 行 SELECT FOR UPDATE，检查 available>0 后减一并创建 appointment，事务提交后释放锁。
- 可考虑使用 Redis 做分布式计数器以支持极高并发场景。

## 示例简化 DDL（Postgres）

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(100) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  role varchar(32) NOT NULL,
  profile jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name varchar(200) NOT NULL,
  gender varchar(16),
  dob date,
  relation varchar(64),
  phone varchar(32),
  id_number varchar(64),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name varchar(200) NOT NULL,
  title varchar(100),
  specialties jsonb,
  rating numeric(3,2),
  hospital_id uuid,
  department_id uuid,
  intro text,
  avatar_url varchar(500)
);

CREATE TABLE schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id),
  hospital_id uuid,
  department_id uuid,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_type varchar(32),
  capacity int DEFAULT 1,
  available int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (doctor_id, date, start_time, end_time)
);

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no varchar(64) UNIQUE NOT NULL,
  patient_id uuid REFERENCES patients(id),
  patient_snapshot jsonb,
  doctor_id uuid REFERENCES doctors(id),
  doctor_name varchar(200),
  hospital_id uuid,
  department_id uuid,
  schedule_id uuid REFERENCES schedules(id),
  date date,
  start_time time,
  end_time time,
  slot_type varchar(32),
  complaint text,
  status varchar(32) DEFAULT 'pending',
  payment_status varchar(32) DEFAULT 'pending',
  voucher_code varchar(64),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE telemedicine_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no varchar(64) UNIQUE NOT NULL,
  applicant_user_id uuid REFERENCES users(id),
  patient_id uuid REFERENCES patients(id),
  patient_snapshot jsonb,
  preferred_method varchar(32),
  description text,
  attachments jsonb,
  status varchar(32) DEFAULT 'pending',
  assigned_doctor_id uuid REFERENCES doctors(id),
  assigned_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  related_type varchar(32),
  related_id uuid,
  provider varchar(64),
  provider_trade_no varchar(128),
  amount numeric(10,2),
  currency varchar(8) DEFAULT 'CNY',
  status varchar(32),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type varchar(32),
  owner_id uuid,
  filename varchar(255),
  url varchar(1000),
  content_type varchar(128),
  size int,
  created_at timestamptz DEFAULT now()
);
```

---

## 下一步建议
1. 确认关键业务流程的边界条件（例如：预约取消退款策略、远程医疗的分配与排期流程）。
2. 基于选择的后端技术栈生成数据库迁移脚本（Flyway/Liquibase/TypeORM/Spring JPA）。
3. 设计 API 端点和身份授权（JWT / session），并制定接口契约（OpenAPI）。

如果你希望，我可以：
- 生成完整的 SQL DDL 文件并提交到项目 `docs/db-design/`。
- 基于你选定的后端栈（Spring Boot 或 Node.js + TypeORM）生成实体类和初始 repository。

告诉我你的优先项，我将生成对应的工件。