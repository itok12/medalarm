#!/bin/sh
set -eu

export NGINX_PORT="${PORT:-10000}"
export BACKEND_API_ORIGIN="${BACKEND_API_ORIGIN:-http://localhost:8080}"
BACKEND_API_ORIGIN="${BACKEND_API_ORIGIN%/}"
export BACKEND_API_ORIGIN

BACKEND_API_HOST="${BACKEND_API_ORIGIN#http://}"
BACKEND_API_HOST="${BACKEND_API_HOST#https://}"
BACKEND_API_HOST="${BACKEND_API_HOST%%/*}"
export BACKEND_API_HOST

envsubst '${NGINX_PORT} ${BACKEND_API_ORIGIN} ${BACKEND_API_HOST}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
