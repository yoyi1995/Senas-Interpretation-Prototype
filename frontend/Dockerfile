# Etapa 1: Build de Angular
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Usamos el nombre del proyecto y la configuración correctamente
RUN npm run build --configuration=production --project=sena_manov2

# Etapa 2: Servir con NGINX
FROM nginx:alpine

# Copiamos los archivos generados a NGINX
COPY --from=builder /app/dist/senas-frontend /usr/share/nginx/html

# Copiamos la configuración personalizada de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



