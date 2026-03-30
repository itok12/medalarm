#!/bin/sh
set -eu

cat >/usr/share/nginx/html/runtime-config.js <<EOF
window.__MEDALARM_RUNTIME_CONFIG__ = {
  API_BASE_URL: "${REACT_APP_API_BASE_URL:-}"
};
EOF
