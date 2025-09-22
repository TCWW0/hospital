# Patient API 测试（Postman）

此文档给出使用 Postman 对患者 API 的测试步骤、示例请求/响应、断言脚本以及用于数据库侧验证的 SQL。假设后端启动于 http://localhost:8080，且 V2 存储过程已在数据库中应用。

测试前准备
- 确认数据库中已存在 hospitals/departments（示例使用 hospitalId=1, departmentId=1）
- 确认 V2 存储过程已部署
- 启动后端服务（开发）：

```powershell
mvn -DskipTests spring-boot:run
```

- 启动后端服务（运行已打包的 jar）：

```powershell
mvn -DskipTests package ; java -jar target\medical-union-1.0.0-SNAPSHOT.jar
```

- 已生成 Postman 集合文件： `docs/api/postman/medical-union-patient-tests.postman_collection.json`，可在 Postman 中导入并使用。 

通用断言（Postman Tests 区块示例）
- 断言 HTTP 状态码为 200
- 断言 JSON 中 resultCode 存在且为 0（对 create/update/delete）
- 对 GET 请求断言 data.id 存在且字段与输入一致

示例 Postman Tests 脚本（可在 Tests 面板粘贴）
```javascript
pm.test("status is 200", function () {
    pm.response.to.have.status(200);
});

var json = pm.response.json();
if (json.resultCode !== undefined) {
    pm.test("resultCode is 0", function () {
        pm.expect(json.resultCode).to.eql(0);
    });
}
if (json.data && json.data.id) {
    pm.test("data.id exists", function () {
        pm.expect(json.data.id).to.be.a('number');
    });
}
```

测试用例

1) 创建患者（Happy Path）
- 请求
  - 方法：POST
  - URL：http://localhost:8080/api/patients
  - Header：Content-Type: application/json
  - Body (raw JSON)：
```json
{
  "name": "测试患者",
  "idCard": "320101199001019999",
  "gender": "M",
  "birthDate": "1990-01-01",
  "phone": "13800009999",
  "address": "测试地址",
  "medicalCardNo": "MC-TEST-001",
  "emergencyContact": "测试家属",
  "emergencyPhone": "13900009999",
  "severityLevel": "MILD",
  "hospitalId": 1,
  "departmentId": 1
}
```
- 期望响应（HTTP 200）
```json
{
  "resultCode": 0,
  "resultMessage": "OK",
  "data": { "id": 101 }
}
```
- Postman 断言：使用上方通用断言脚本
- 数据库验证 SQL（在 MySQL 中执行）：
```sql
SELECT * FROM patients WHERE id = <newId>;
SELECT * FROM audit_logs WHERE target_table='patients' AND target_id = <newId> ORDER BY created_at DESC LIMIT 1;
```

2) 创建患者（身份证重复）
- 前置：向 patients 插入与上面相同的 id_card，或使用同一请求重复调用 Create API
- 请求与 Body 同上
- 期望响应：
  - resultCode: -4
  - resultMessage: "Duplicate id_card"
- 数据库验证：确认未新增患者记录或 audit_logs（无新记录）

如何在数据库上部署修复（你已执行 V2，现有 V3 脚本在 repo 下）：

1. 在测试/生产库上运行 V3 脚本（该脚本会替换 sp_safe_create_patient）：

```powershell
mysql -u <user> -p"<password>" medical_union < src\main\resources\db\migration\V3__prevent_duplicate_patients.sql
```

2. 推荐同时在 `patients.id_card` 上添加唯一索引以防止并发下仍然插入重复（注意：如果表中存在 NULL 或重复值，需要先清理）：

```sql
-- 创建唯一索引（请先确保没有重复数据）
ALTER TABLE patients ADD CONSTRAINT uq_patients_id_card UNIQUE (id_card);
```

3. 验证：再次运行创建相同 idCard 的 POST 请求，应返回 resultCode = -4；执行如下 SQL 应该没有新记录：

```sql
SELECT COUNT(*) FROM patients WHERE id_card = '320101199001019999';
```

3) 查询患者详情
- 请求：GET http://localhost:8080/api/patients/{id}
- 期望响应：HTTP 200
```json
{
  "data": { ...  前面创建的 Patient 对象 ... }
}
```
- 断言示例：
```javascript
pm.test("has data", function(){
  var j = pm.response.json();
  pm.expect(j.data).to.be.an('object');
  pm.expect(j.data.name).to.eql('测试患者');
});
```

4) 更新患者（存在）
- 请求：PUT http://localhost:8080/api/patients/{id}
- Body：
```json
{
  "name": "测试患者 更新",
  "phone": "13811112222",
  "address": "新的地址"
}
```
- 期望响应：
```json
{ "resultCode": 0, "resultMessage": "OK" }
```
- 数据库验证：
```sql
SELECT name, phone, address FROM patients WHERE id = <id>;
SELECT * FROM audit_logs WHERE action='UPDATE_PATIENT' AND target_id=<id> ORDER BY created_at DESC LIMIT 1;
```

5) 删除患者（无 visits，成功）
- 请求：DELETE http://localhost:8080/api/patients/{id}
- 期望响应：{ "resultCode": 0, "resultMessage": "OK" }
- 验证：
```sql
SELECT COUNT(*) FROM patients WHERE id = <id>; -- 应为 0
SELECT * FROM audit_logs WHERE action='DELETE_PATIENT' AND target_id = <id> ORDER BY created_at DESC LIMIT 1;
```

6) 删除患者（存在 visits，失败场景）
- 前置：在 visits 表插入一条 patient_id = <id> 的记录
- 请求：DELETE http://localhost:8080/api/patients/{id}
- 期望响应：{ "resultCode": -3, "resultMessage": "Cannot delete patient with visits" }
- 验证：patients 仍存在，audit_logs 没有删除记录

其他注意事项与 Postman 配置
- 若后端启用了鉴权（JWT），请在 Postman 的 Authorization/Headers 中配置 Authorization: Bearer <token>
- 为避免并发导致测试失败，建议每次创建患者使用不同的 idCard 或在测试结束时清理数据
- 将 above SQL 中的 <newId> 替换为响应返回的 id

我可以为你生成：
- 一个 Postman 集合（JSON）文件，包含上面 6 个测试用例和对应 Tests 脚本
- 或者把这些请求输出为 curl 脚本

请告诉我你要哪个（Postman 集合或 curl 脚本），我会立刻把文件写到仓库并给出导入/使用说明。