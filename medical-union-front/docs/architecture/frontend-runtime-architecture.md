# 前端运行时架构概览（2025-10 重构）

本次结构调整聚焦于梳理接口访问层与运行时配置，确保未来对接真实后端或扩展模块时具备高内聚、低耦合的基础。以下内容总结当前前端项目的关键分层与约定。

## 1. 分层结构

```
src/
├─ config/runtime.ts        # 统一读取环境变量、本地存储偏好的运行时辅助
├─ utils/request.ts         # Axios 单例，请求/响应拦截与错误处理
├─ api/
│  ├─ index.ts              # API 门面层，统一出口
│  ├─ http/                 # 真实后端 HTTP 调用（依赖 request.ts）
│  │  ├─ auth.ts
│  │  ├─ patient.ts
│  │  ├─ referral.ts
│  │  ├─ statistics.ts
│  │  └─ system.ts
│  ├─ mock/                 # Mock 数据源与工具
│  │  ├─ auth.ts
│  │  ├─ patients.ts
│  │  ├─ referrals.ts
│  │  ├─ telemedicine.ts ...
│  └─ services/
│     └─ dashboard.ts       # 基于 mock 的领域服务示例（后续可接入真实 API）
└─ views/、components/ ...   # 视图层按需引用 api/index.ts 或明确的子模块
```

### 门面层（`src/api/index.ts`）
- 只负责 **导出**：既包含 HTTP 模块，也包含 mock 数据/服务。
- 视图层继续通过 `@/api` 引入，无需关心具体实现来自 mock 还是后端。
- 保留了 `fetchPatientsMock` 等命名导出，便于调试或测试场景直接访问 mock 数据源。

### HTTP 层（`src/api/http/*`）
- 每个文件聚焦一个领域（认证、患者、转诊、统计、系统）。
- 依赖 `{ http }` 客户端，所有 header/token 处理、错误抛出逻辑都由 `utils/request.ts` 承担。
- 后续若补充更多接口，只需在对应领域文件扩展即可。

### Mock 层
- `src/api/mock/*` 只负责数据与领域行为模拟。
- 新增 `mock/auth.ts` 统一向外提供登录模拟能力，避免视图层直接引用 `utils` 目录。
- `utils/mockApi.ts` 现已使用 `config/runtime.ts` 的判定逻辑，避免多处复制粘贴。

### 领域服务层（`src/api/services/*`）
- 面向视图提供聚合数据/统计等组合逻辑，当前示例为 `dashboard.ts`。
- 现阶段依赖 mock 数据，可在真实接口就绪后替换内部实现而不影响视图层。

## 2. 运行时配置（`src/config/runtime.ts`）

- `shouldUseMockApi()`、`shouldUseMockAuth()`：统一读取环境变量及本地存储，决定是否走 mock。
- `getApiBaseUrl()`：开发环境返回空字符串交由 Vite 代理，生产环境读取 `VITE_API_BASE_URL`。
- `getApiTimeout()`：集中管理超时设置，避免在多个文件写死。
- 视图层（如 `Login.vue`）已切换到该模块，便于后续扩展统一入口。

## 3. 视图层使用建议

1. **优先引用门面层**：`import { patientApi } from '@/api';`，保证后续替换实现时无需改动视图。
2. **需要 mock 专属能力时**：显式引入 `@/api/mock/*`，并在组件中通过 `shouldUseMockApi()` 做动态选择。
3. **新增领域服务**：在 `src/api/services/` 下创建文件，聚合多个接口或 mock 数据的组合逻辑，再在 `api/index.ts` 中导出。
4. **避免直接访问 localStorage/env**：一律通过 `config/runtime.ts` 暴露的函数读取，确保运行时策略一致。

## 4. 后续扩展指南

- **接入真实后端**：
  - 在 HTTP 层补齐对应端点。
  - 在服务层中根据 `shouldUseMockApi()` 决定调用 mock 还是 http，或直接切换到 http 实现。
- **新增模块**：
  - 若仅为简单 CRUD，可直接在 `api/http/` 新建领域文件。
  - 若涉及复合数据/统计，建议同时在 `api/services/` 建立聚合层。
- **清理冗余 mock**：
  - 当前未删除任何历史文件；如需移除某些 mock 数据，请先确认调用方并在 PR 中说明，以便审阅。

以上结构保证在迭代新模块或上线后端对接时，只需在“实现层”调整，视图层和业务逻辑可保持稳定。欢迎根据后续需求继续扩展。