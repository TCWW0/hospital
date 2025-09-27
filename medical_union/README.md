Medical Union — Backend (Auth module scaffold)

This directory contains a lightweight scaffold for the Auth module intended for the Medical Union backend.

Structure created by automation:
- src/main/java/com/medicalunion/auth/...  (DTOs, models, mapper interfaces, service, controller, exceptions)
- src/main/resources/mybatis/mapper/auth/UserAuthMapper.xml
- docs/auth-stored-procedures.md  (place to implement and document stored procedures contract)

How to use:
1. Open this folder as a Maven project in IntelliJ IDEA (or import as existing Maven project).
2. Configure your local `application.yml` or `application.properties` with a MySQL datasource.
3. Implement the stored procedures in your MySQL database according to `docs/auth-stored-procedures.md`.
4. Run `mvn -DskipTests spring-boot:run` to start the app (or run from IDE).

Notes:
- This scaffold uses MyBatis callable statements to invoke stored procedures. The stored procedures must return `errcode` and `errmsg` via OUT params.
- Password hashing in scaffold currently uses MD5 only as a placeholder—replace with BCrypt in production.
