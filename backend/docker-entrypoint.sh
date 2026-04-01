#!/bin/sh
set -eu

convert_render_database_url() {
  raw_url="$1"

  case "$raw_url" in
    jdbc:postgresql://*)
      normalized_url="postgresql://${raw_url#jdbc:postgresql://}"
      ;;
    postgresql://*)
      normalized_url="$raw_url"
      ;;
    postgres://*)
      normalized_url="postgresql://${raw_url#postgres://}"
      ;;
    *)
      return 1
      ;;
  esac

  normalized_url="${normalized_url#postgresql://}"

  if [ "${normalized_url#*@}" != "$normalized_url" ]; then
    normalized_url="${normalized_url#*@}"
  fi

  printf 'jdbc:postgresql://%s' "$normalized_url"
}

if [ -n "${DATABASE_URL:-}" ] && [ -z "${JDBC_DATABASE_URL:-}" ]; then
  JDBC_DATABASE_URL="$(convert_render_database_url "$DATABASE_URL" || true)"
  if [ -n "${JDBC_DATABASE_URL:-}" ]; then
    export JDBC_DATABASE_URL
  fi
fi

exec java ${JAVA_OPTS:-} -jar /app/app.jar
