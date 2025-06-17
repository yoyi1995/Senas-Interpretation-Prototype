# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Producción
FROM nginx:stable-alpine AS production

# Copiar build Angular
COPY --from=builder /app/dist/senas-frontend/browser /usr/share/nginx/html

# Usar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


