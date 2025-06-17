# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Producción con nginx
FROM nginx:stable-alpine AS production

# Copiar archivos Angular
COPY --from=builder /app/dist/senas-frontend/browser /usr/share/nginx/html

# Copiar configuración nginx personalizada (¡esta es la parte clave!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]



