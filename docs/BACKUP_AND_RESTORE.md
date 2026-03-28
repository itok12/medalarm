# Backup and Restore

## What To Back Up

- PostgreSQL database data
- Render environment variables or secret manager values
- Versioned application source and migration files

## Backup Routine

1. Take a PostgreSQL dump before every production deployment and retain daily backups.
2. Keep at least one backup from before the latest schema migration.
3. Store backups in an encrypted location with access limited to maintainers.

Example:

```bash
pg_dump "$DATABASE_URL" --format=custom --file medalarm-backup.dump
```

If username and password are supplied separately:

```bash
pg_dump --host localhost --port 5432 --username medalarm --dbname medalarm --format=custom --file medalarm-backup.dump
```

## Restore Routine

1. Restore into a staging database first.
2. Start the backend against the restored database and confirm Flyway validation passes.
3. Verify medicines, alarms, logs, and caregiver links are intact before restoring production.

Example:

```bash
pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" medalarm-backup.dump
```

## Recovery Notes

- Restore the database before redeploying older application code.
- Never skip migration validation after a restore.
- Keep a rollback note with the backup timestamp, git commit, and operator name.
