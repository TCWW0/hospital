Patient API Implementation

Summary
-------
This document describes how the Java backend calls stored procedures for sensitive create/update/delete operations for patients.

Stored Procedures added (V2)
----------------------------
- `sp_safe_create_patient(...)` - creates a patient and returns `newId`, `resultCode`, `resultMessage`.
- `sp_safe_update_patient(...)` - updates patient fields and returns `resultCode`, `resultMessage`.
- `sp_safe_delete_patient(...)` - deletes patient if no visits exist; returns `resultCode`, `resultMessage`.

Java mapping
------------
- `PatientMapper.safeCreatePatient(Map<String,Object> params)` maps to `sp_safe_create_patient` (callable).
- `PatientService.createPatient(Patient patient)` now calls the stored procedure via `PatientMapper.safeCreatePatient` and interprets `resultCode`:
  - `0` = success (newId available)
  - negative codes (-1, -2, -3) = different failure conditions (SQL error, not found, has visits, etc.)

Error translation
-----------------
- On `resultCode == 0`: success, Java returns created `Patient` with `id` set.
- On `resultCode != 0`: Java throws `IllegalArgumentException` with `resultMessage`, which will be translated to HTTP 400 by `GlobalExceptionHandler`.
- On unexpected exceptions: Java throws RuntimeException -> HTTP 500.

Example usage (HTTP)
--------------------
1) Create patient
POST /api/patients
Body: JSON matching Patient entity

Response (201 or 200):
{
  "code": 200,
  "message": "创建患者成功",
  "data": { ... patient object with id ... }
}

2) Delete patient
DELETE /api/patients/{id}

Response on failure (has visits):
{
  "code": 400,
  "message": "Cannot delete patient with visits",
  "data": null
}

Notes
-----
- Stored procedures are versioned under `src/main/resources/db/migration/V2__stored_procedures.sql`.
- Operator should apply V2 in DB after applying V1.
- If you want me to add stored procedures for doctors/users/other domain operations, I can prepare more V3/V4 SQL files.
