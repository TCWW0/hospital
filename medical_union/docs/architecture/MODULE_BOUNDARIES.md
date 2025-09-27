# 模块边界与职责

common
- 目的：聚合通用能力与规范
- 内容：ApiResponse、ErrorCode、BizException、JwtUtil、全局异常处理、PasswordConfig、JSON 配置

infra
- 目的：数据访问与运行时基础设施
- 内容：数据源配置、MyBatis 配置与拦截器、BaseMapper、分页器、Flyway/Liquibase

auth
- 目的：认证鉴权
- 内容：登录、注册、token 生成与验证、存储过程 sp_user_login_simple/sp_user_register
- 依赖：common、infra

user
- 目的：用户基础资料与口令管理
- 内容：/user/me、更新资料、修改密码、sp_user_get_info、sp_user_update_profile、sp_user_change_password
- 依赖：common、infra

patient
- 目的：患者档案、就诊记录
- 内容：/patient/profile、/patient/visits
- 依赖：common、infra、user（可选）

doctor
- 目的：医生信息
- 内容：/doctors、/doctors/{id}
- 依赖：common、infra

schedule
- 目的：医生排班
- 内容：/doctors/{id}/schedules
- 依赖：common、infra、doctor

appointment
- 目的：预约挂号
- 内容：创建/列表/详情/取消，sp_appointment_*
- 依赖：common、infra、schedule、patient、doctor

telemedicine
- 目的：远程医疗
- 内容：申请/列表，sp_telemedicine_*
- 依赖：common、infra、patient、doctor

依赖原则
- 只允许从上到下依赖（controller→service→repo/mapper）
- 跨模块只通过 service 接口，不直接访问他人 mapper
- DTO 与错误码放在 common，避免相互复制
