#!/bin/sh
set -eu

export NGINX_PORT="${PORT:-10000}"
envsubst '${NGINX_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
