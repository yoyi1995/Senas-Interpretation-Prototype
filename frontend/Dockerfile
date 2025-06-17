# Etapa 1: Build de Angular
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production --project sena_manov2

# Etapa 2: Servir estáticamente con NGINX
FROM nginx:stable-alpine
COPY --from=build /app/dist/senas-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 10000
CMD ["nginx", "-g", "daemon off;"]
