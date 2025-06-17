# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias (puedes usar --legacy-peer-deps si necesitas)
RUN npm install --legacy-peer-deps

# Copiar todo el código fuente
COPY . .

# Construir la app en modo producción
RUN npm run build -- --configuration production

# Etapa 2: Producción
FROM nginx:stable-alpine AS production

# Copiar los archivos compilados desde la etapa builder
COPY --from=builder /app/dist/senas-frontend/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx si tienes una (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto (opcional si usas docker run -p)
EXPOSE 80

# Comando para correr nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]

