# 存储过程：sp_user_update_profile 说明

本存储过程用于更新用户的基础信息：姓名（可映射 username 或 real_name）、证件号（id_number）、联系电话（phone）。

## 签名
```
sp_user_update_profile(
  IN  p_user_id    INT,
  IN  p_name       VARCHAR(100),
  IN  p_id_number  VARCHAR(64),
  IN  p_phone      VARCHAR(20),
  OUT p_errcode    INT,
  OUT p_errmsg     VARCHAR(255)
)
```

- 参数为“可选更新”语义：当某个 IN 参数为 NULL 或空串时，应在过程内忽略该字段更新。
- 请确保与 Java 侧 MyBatis 映射保持相同顺序与命名（见下文）。

## 建议实现要点
- 对应表：`user`
- 需要处理的列：
  - name ->（若无 real_name 列）可暂映射到 `username`（注意唯一键冲突）
  - id_number -> `id_number`（唯一键）
  - phone -> `phone`（唯一键）
- 建议流程：
  1. 校验 p_user_id 是否存在，不存在则 `p_errcode=1003 (USER_NOT_FOUND)`。
  2. 对每个有值的字段执行冲突检查（唯一键）：
     - 若冲突且不是本人，则返回 `p_errcode=1005 (INVALID_INPUT)`，`p_errmsg` 明确冲突字段。
  3. 执行 UPDATE，仅更新非空字段。
  4. 成功：`p_errcode=0, p_errmsg='OK'`。

## Java 侧映射
- 接口：`UserAuthMapper#callUserUpdateProfile(Map<String, Object> params)`
- XML：`src/main/resources/mybatis/mapper/auth/UserAuthMapper.xml`
```
<select id="callUserUpdateProfile" statementType="CALLABLE" parameterType="map">
  CALL sp_user_update_profile(
    #{userId, mode=IN, jdbcType=INTEGER},
    #{name, mode=IN, jdbcType=VARCHAR},
    #{idNumber, mode=IN, jdbcType=VARCHAR},
    #{phone, mode=IN, jdbcType=VARCHAR},
    #{errcode, mode=OUT, jdbcType=INTEGER},
    #{errmsg, mode=OUT, jdbcType=VARCHAR}
  )
</select>
```
- 调用示例（Java Service）：
```
Map<String, Object> params = new HashMap<>();
params.put("userId", userId);
params.put("name", req.getName());
params.put("idNumber", req.getIdNumber());
params.put("phone", req.getPhone());
params.put("errcode", null);
params.put("errmsg", null);
userAuthMapper.callUserUpdateProfile(params);
Integer err = (Integer) params.get("errcode");
String msg = (String) params.get("errmsg");
if (err == null) throw new BizException(ErrorCode.DB_ERROR, "No errcode returned");
if (err != 0) throw new BizException(ErrorCode.fromCode(err), msg);
```

## 联调测试建议
1. 准备：先通过注册或造数准备一条 `user` 记录，拿到 user_id。
2. 成功用例（全部字段）：
   - name: "张三"，idNumber: 有效且未占用，phone: 有效且未占用 -> 期望 `errcode=0`。
3. 部分字段更新：
   - 只传 name 或只传 phone/idNumber -> 未传的字段保持不变。
4. 冲突用例：
   - 传入一个已被其他用户占用的 phone 或 idNumber -> 期望 `errcode=1005`，errmsg 说明冲突。
5. 不存在用户：
   - 传入不存在的 p_user_id -> 期望 `errcode=1003`。

## 注意
- 如果最终采用 username 作为展示姓名，请注意业务上“用户名”和“姓名”的定义差异。后续可在表结构中引入 `real_name` 列，避免语义混淆。
- 过程内请统一将空串视为 NULL，避免误将字段更新为空字符串。
