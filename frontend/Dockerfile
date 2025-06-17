# Etapa de construcción
FROM node:18 AS builder
WORKDIR /app

# 1. Instala dependencias y Angular CLI
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && \
    npm install -g @angular/cli

# 2. Copia código y construye
COPY src ./src
COPY angular.json tsconfig.json ./
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build -- --configuration production --output-path=dist --output-hashing=none

# Etapa de producción
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
