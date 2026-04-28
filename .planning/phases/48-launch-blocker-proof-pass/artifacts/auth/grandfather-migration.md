# Grandfather Migration Evidence

Captured: 2026-04-28T09:28:00Z
Plan: 48-03 auth/OAuth/admin smoke

Target environment: production database from local `.env.local` `DATABASE_URL`.
The database URL was not printed or stored.

## SQL Evidence

```sql
SELECT * FROM phase26_migration_meta WHERE key = 'grandfather_email_verified';
```

Result:

```json
[
  {
    "key": "grandfather_email_verified",
    "value": "2026-04-25 04:51:00.645522+00",
    "created_at": "2026-04-25T08:51:00.645Z"
  }
]
```

```sql
SELECT COUNT(*) FROM "user" WHERE "emailVerified" IS NOT TRUE;
```

Result:

```json
[{ "count": 0 }]
```

```sql
SELECT to_regclass('public.artist_applications');
```

Result:

```json
[{ "table_name": "artist_applications" }]
```

AUTH-28 status: passed for migration presence and production DB state.

