# Etapa de construcción
FROM node:18 AS builder
WORKDIR /app

# 1. Instala solo dependencias necesarias
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# 2. Copia solo lo esencial para build
COPY src ./src
COPY angular.json tsconfig.json ./

# 3. Build con memoria limitada
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build -- --configuration production --output-hashing=none

# Etapa de producción
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
