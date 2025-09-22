Implementation notes

What changed:
- Flyway removed from build; manual migration recommended (see DB_MIGRATION_MANUAL.md)
- V1__initial_schema.sql applied to DB by operator
- Added V2__stored_procedures.sql containing safe create/update/delete stored procedures for patients
- PatientMapper and PatientService updated to call stored procedures for create/update/delete operations
- GlobalExceptionHandler added to provide uniform error responses

Next actions for operator:
1) Apply V2 stored procedures to database (if not applied):
   mysql -u root -p"Tcww3498" medical_union < src\main\resources\db\migration\V2__stored_procedures.sql
2) Run application and exercise endpoints (see patient-api-impl.md)
3) Provide feedback and request additional stored procedures or API changes

Contact points:
- I will continue implementing authentication and other modules after you validate patient flows.
