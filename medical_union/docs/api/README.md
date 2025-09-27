# Medical Union API 文档

本目录包含医疗联盟系统的所有API文档，按模块进行组织。

## 文档结构

```
docs/api/
├── README.md                 # 文档总览（本文件）
├── auth/                     # 认证模块API文档
│   ├── auth-api.md          # 认证接口详细文档
│   ├── auth-models.md       # 数据模型定义
│   └── auth-examples.md     # 请求响应示例
├── patient/                  # 患者模块API文档（待添加）
├── doctor/                   # 医生模块API文档（待添加）
└── common/                   # 公共API文档
    ├── error-codes.md       # 错误代码说明
    └── response-format.md   # 统一响应格式
```

## 快速导航

- [认证模块 API](./auth/auth-api.md)
- [错误代码说明](./common/error-codes.md)
- [响应格式规范](./common/response-format.md)

## 版本信息

- **当前版本**: v1.0.0
- **更新日期**: 2025年9月24日
- **维护者**: Medical Union 开发团队

## 使用说明

1. 所有API均需要遵循统一的响应格式
2. 认证接口返回JWT token，有效期24小时
3. 需要认证的接口在请求头中携带 `Authorization: Bearer {token}`

## 环境信息

- **开发环境**: http://localhost:8080
- **测试环境**: 待部署
- **生产环境**: 待部署

---

📝 **注意**: 本文档将随着系统开发进度持续更新，请关注版本变更。