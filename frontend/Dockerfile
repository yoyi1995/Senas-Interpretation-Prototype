# Etapa 1: Build de Angular
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration production

# Encuentra automáticamente la carpeta generada dentro de dist/
RUN export APP_NAME=$(ls dist) && \
    echo "App name: $APP_NAME" && \
    mv dist/$APP_NAME /app/dist

# Etapa 2: Servir con NGINX
FROM nginx:alpine

# Copia archivos generados al NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuración personalizada de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


