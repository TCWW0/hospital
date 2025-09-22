# 医联体管理系统 API 文档

## 概述
本文档描述了医联体管理系统的完整API接口，包括前端交互流程、请求格式和响应数据结构。

## 基础信息
- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

## 前端交互流程

### 1. 用户登录流程
```
用户输入用户名、密码、角色类型 
    ↓
POST /auth/login
    ↓
获取用户信息和token
    ↓
根据角色类型跳转到不同的工作台
    ↓
加载对应角色的菜单和数据
```

### 2. 角色权限流程
```
登录成功后 → 获取用户角色 → 动态加载菜单
    ↓
DOCTOR角色: 医生工作台 → 患者管理、转诊管理、统计数据
    ↓
PATIENT角色: 患者个人中心 → 个人信息、就诊记录、转诊记录
    ↓
ADMIN角色: 管理员后台 → 系统管理、数据统计、用户管理
```

---

## API 接口详细说明

### 🔐 认证模块 (Authentication)

#### 1. 用户登录
```http
POST /auth/login
```

**请求参数:**
```json
{
  "username": "patient1",          // 用户名
  "password": "123456",            // 密码
  "userType": "PATIENT"            // 用户类型: DOCTOR, PATIENT, ADMIN
}
```

**成功响应 (200):**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "patient1",
      "userType": "PATIENT",
      "relatedId": 1,                // 关联的患者/医生ID
      "createdAt": "2025-09-21 20:53:51"
    }
  }
}
```

**失败响应 (200 with error code):**
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

#### 2. 用户登出
```http
POST /auth/logout
```

**响应:**
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

### 👥 患者管理模块 (Patient Management)

#### 1. 分页查询患者列表
```http
GET /patients?page=1&size=10&name=张&gender=男&severityLevel=轻症
```

**查询参数:**
- `page`: 页码 (默认1)
- `size`: 每页大小 (默认10)
- `name`: 患者姓名 (可选，模糊查询)
- `gender`: 性别 (可选，男/女)
- `severityLevel`: 病情严重程度 (可选，轻症/中症/重症/危重)

**响应:**
```json
{
  "code": 200,
  "message": "查询患者列表成功",
  "data": [
    {
      "id": 1,
      "createdAt": "2025-09-21 20:53:51",
      "updatedAt": "2025-09-21 20:53:51",
      "name": "张三",
      "idCard": "110101199001011234",
      "gender": "男",
      "birthDate": "1990-01-01",
      "phone": "13912345678",
      "address": "北京市朝阳区",
      "emergencyContact": "李四",
      "emergencyPhone": "13987654321",
      "medicalHistory": "高血压病史",
      "severityLevel": "轻症",
      "hospitalId": 1,
      "hospitalName": "北京协和医院"
    }
  ]
}
```

#### 2. 查询单个患者详情
```http
GET /patients/{id}
```

**响应:**
```json
{
  "code": 200,
  "message": "查询患者详情成功",
  "data": {
    "id": 1,
    "name": "张三",
    "idCard": "110101199001011234",
    "gender": "男",
    "birthDate": "1990-01-01",
    "phone": "13912345678",
    "address": "北京市朝阳区",
    "emergencyContact": "李四",
    "emergencyPhone": "13987654321",
    "medicalHistory": "高血压病史",
    "severityLevel": "轻症",
    "hospitalId": 1,
    "hospitalName": "北京协和医院",
    "createdAt": "2025-09-21 20:53:51",
    "updatedAt": "2025-09-21 20:53:51"
  }
}
```

#### 3. 创建患者
```http
POST /patients
```

**请求参数:**
```json
{
  "name": "王五",
  "idCard": "110101199002021234",
  "gender": "女",
  "birthDate": "1990-02-02",
  "phone": "13912345679",
  "address": "北京市海淀区",
  "emergencyContact": "王六",
  "emergencyPhone": "13987654322",
  "medicalHistory": "糖尿病病史",
  "severityLevel": "中症",
  "hospitalId": 2
}
```

#### 4. 更新患者信息
```http
PUT /patients/{id}
```

#### 5. 删除患者 (使用存储过程)
```http
DELETE /patients/{id}
```

---

### 🔄 转诊管理模块 (Referral Management)

#### 1. 分页查询转诊记录
```http
GET /referrals?page=1&size=10&patientId=1&status=PENDING
```

**查询参数:**
- `page`: 页码
- `size`: 每页大小
- `patientId`: 患者ID (可选)
- `status`: 转诊状态 (可选，PENDING/APPROVED/REJECTED/COMPLETED)

**响应:**
```json
{
  "code": 200,
  "message": "查询转诊记录成功",
  "data": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "张三",
      "fromHospitalId": 1,
      "fromHospitalName": "北京协和医院",
      "toHospitalId": 2,
      "toHospitalName": "北京大学第一医院",
      "fromDoctorId": 1,
      "fromDoctorName": "李医生",
      "toDoctorId": 2,
      "toDoctorName": "王医生",
      "reason": "需要专科治疗",
      "urgencyLevel": "NORMAL",
      "status": "PENDING",
      "notes": "患者病情稳定",
      "createdAt": "2025-09-21 20:53:51",
      "updatedAt": "2025-09-21 20:53:51"
    }
  ]
}
```

#### 2. 创建转诊记录
```http
POST /referrals
```

#### 3. 更新转诊状态
```http
PUT /referrals/{id}/status
```

**请求参数:**
```json
{
  "status": "APPROVED",           // PENDING/APPROVED/REJECTED/COMPLETED
  "notes": "同意接收患者"         // 备注信息
}
```

---

### 📊 统计分析模块 (Statistics)

#### 1. 医生工作台数据
```http
GET /statistics/doctor/dashboard/{doctorId}
```

**响应:**
```json
{
  "code": 200,
  "message": "获取医生工作台数据成功",
  "data": {
    "doctorInfo": {
      "doctorId": 1,
      "name": "李医生",
      "title": "主任医师",
      "department": "心内科",
      "hospital": "北京协和医院"
    },
    "todayStatistics": {
      "totalPatients": 15,
      "newPatients": 3,
      "referralsOut": 2,
      "referralsIn": 1
    },
    "monthlyStatistics": {
      "totalPatients": 450,
      "referralsOut": 25,
      "referralsIn": 18,
      "successRate": 0.92
    },
    "recentReferrals": [
      {
        "id": 1,
        "patientName": "张三",
        "toHospital": "北京大学第一医院",
        "status": "PENDING",
        "createdAt": "2025-09-21 20:53:51"
      }
    ]
  }
}
```

#### 2. 患者个人中心数据
```http
GET /statistics/patient/dashboard/{patientId}
```

**响应:**
```json
{
  "code": 200,
  "message": "获取患者个人中心数据成功",
  "data": {
    "patientInfo": {
      "patientId": 1,
      "name": "张三",
      "gender": "男",
      "birthDate": "1990-01-01",
      "phone": "13912345678",
      "severityLevel": "轻症",
      "currentHospital": "北京协和医院"
    },
    "medicalSummary": {
      "totalVisits": 5,
      "totalReferrals": 2,
      "lastVisitDate": "2025-09-20",
      "nextAppointment": "2025-09-25"
    },
    "recentVisits": [
      {
        "id": 1,
        "hospitalName": "北京协和医院",
        "doctorName": "李医生",
        "visitDate": "2025-09-20",
        "diagnosis": "高血压复查",
        "treatment": "调整用药"
      }
    ],
    "recentReferrals": [
      {
        "id": 1,
        "fromHospital": "北京协和医院",
        "toHospital": "北京大学第一医院",
        "reason": "需要专科治疗",
        "status": "APPROVED",
        "referralDate": "2025-09-21"
      }
    ]
  }
}
```

#### 3. 医院概览统计
```http
GET /statistics/hospital/overview
```

#### 4. 转诊趋势分析
```http
GET /statistics/referrals/trends?startDate=2025-01-01&endDate=2025-12-31
```

---

### 🏥 系统健康检查

#### 应用健康状态
```http
GET /actuator/health
```

**响应:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    }
  }
}
```

---

## 前端页面设计建议

### 1. 登录页面
- 用户名/密码输入框
- 角色选择下拉框 (医生/患者/管理员)
- 登录按钮
- 记住密码功能

### 2. 医生工作台 (DOCTOR角色)
```
顶部导航: 个人信息 | 患者管理 | 转诊管理 | 统计报表 | 登出
左侧菜单:
  - 工作台首页 (dashboard数据)
  - 患者列表 (分页表格)
  - 转诊管理 (转出/转入记录)
  - 数据统计 (图表展示)
```

### 3. 患者个人中心 (PATIENT角色)
```
顶部导航: 个人信息 | 就诊记录 | 转诊记录 | 登出
主要区域:
  - 个人信息卡片
  - 就诊统计卡片
  - 最近就诊记录列表
  - 转诊记录列表
```

### 4. 管理员后台 (ADMIN角色)
```
左侧菜单:
  - 系统概览
  - 用户管理
  - 医院管理
  - 数据统计
  - 系统设置
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 401 | 认证失败 |
| 403 | 权限不足 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 注意事项

1. **认证机制**: 登录成功后需要在后续请求的Header中携带token
2. **分页查询**: 所有列表接口都支持分页，使用`page`和`size`参数
3. **数据验证**: 前端需要进行基本的数据验证，后端也会进行验证
4. **错误处理**: 需要统一处理API返回的错误信息
5. **中文编码**: 注意处理中文字符的编码问题