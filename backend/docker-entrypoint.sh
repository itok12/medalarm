#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ] && [ -z "${JDBC_DATABASE_URL:-}" ]; then
  case "$DATABASE_URL" in
    jdbc:postgresql://*)
      export JDBC_DATABASE_URL="$DATABASE_URL"
      ;;
    postgresql://*)
      export JDBC_DATABASE_URL="jdbc:${DATABASE_URL}"
      ;;
    postgres://*)
      export JDBC_DATABASE_URL="jdbc:postgresql://${DATABASE_URL#postgres://}"
      ;;
  esac
fi

exec java ${JAVA_OPTS:-} -jar /app/app.jar
