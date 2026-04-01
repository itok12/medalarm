#!/bin/sh
set -eu

export NGINX_PORT="${PORT:-10000}"
export BACKEND_HOSTPORT="${BACKEND_HOSTPORT:-backend:8080}"
envsubst '${NGINX_PORT} ${BACKEND_HOSTPORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
