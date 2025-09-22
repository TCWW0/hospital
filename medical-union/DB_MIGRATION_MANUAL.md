DB migration manual

Overview
--------
Flyway has been removed from project dependencies and auto-migration disabled in `application.yml` to let the operator (you) review and apply schema changes manually.

Files
-----
- `src/main/resources/db/migration/V1__initial_schema.sql` - initial schema SQL (DDL + sample data). Review before applying.

Recommended manual application steps (PowerShell)
-----------------------------------------------
1) Create the database (if not exists):

   mysql -u root -p"Tcww3498" -e "CREATE DATABASE IF NOT EXISTS medical_union CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

2) Apply the SQL migration file:

   mysql -u root -p"Tcww3498" medical_union < src\main\resources\db\migration\V1__initial_schema.sql

   Notes:
   - Use `utf8mb4` if you expect 4-byte characters.
   - If you prefer to execute interactively, open mysql shell and paste the SQL.

3) Verify tables and sample data:

   mysql -u root -p"Tcww3498" -e "USE medical_union; SHOW TABLES; SELECT COUNT(*) FROM patients; SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM referrals;"

4) Check Flyway history (optional):

   If you plan to restore Flyway later, create a minimal `flyway_schema_history` entry manually or re-enable Flyway and let it baseline. For now, migrations will be tracked externally by your review process.

Rollback
--------
- The SQL file is additive; to rollback in development you can drop the database:

   mysql -u root -p"Tcww3498" -e "DROP DATABASE IF EXISTS medical_union;"

- For production environments prepare per-version down-scripts before applying any changes.

Notes & Recommendations
-----------------------
- Keep `src/main/resources/db/migration` files under version control. When you want to re-enable automated migrations, we can re-add Flyway with a tested driver version.
- For large schema refactors consider using a copy of production DB and test the migration there first.
- If you'd like, I can also generate separate incremental SQL files (V2, V3) for staged changes and provide rollback scripts.

Next Steps
----------
- If you want me to re-enable Flyway and adjust driver/Flyway versions instead, tell me and I will prepare a minimal patch.
- Otherwise, run the steps above and paste the outputs if you want me to verify or troubleshoot further.
