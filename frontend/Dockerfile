# Fase de construcción
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production --project sena_manov2

# Fase de producción con Nginx
FROM nginx:stable-alpine
RUN apk add --no-cache gettext # Instala envsubst
COPY --from=build /app/dist/senas-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template # Copia el archivo de configuración como plantilla
EXPOSE 80
CMD ["sh", "-c", "envsubst '$$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
