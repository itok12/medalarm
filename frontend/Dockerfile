FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY docker-entrypoint.d/30-render-port.sh /docker-entrypoint.d/30-render-port.sh
RUN chmod +x /docker-entrypoint.d/30-render-port.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh
EXPOSE 10000
CMD ["nginx", "-g", "daemon off;"]
