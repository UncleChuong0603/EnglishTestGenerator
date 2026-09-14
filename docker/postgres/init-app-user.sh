#!/usr/bin/env sh
set -eu

# This file only runs when the PostgreSQL data directory is first initialized.
# psql's quoted variables keep credentials safe from SQL interpolation.
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=app_user="$APP_DATABASE_USER" \
  --set=app_password="$APP_DATABASE_PASSWORD" \
  --set=app_database="$POSTGRES_DB" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'app_user') \gexec
SELECT format('ALTER DATABASE %I OWNER TO %I', :'app_database', :'app_user') \gexec
ALTER SCHEMA public OWNER TO :"app_user";
GRANT ALL ON SCHEMA public TO :"app_user";
SQL
