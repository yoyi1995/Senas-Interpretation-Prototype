# Etapa de construcción
FROM node:18 AS builder
WORKDIR /app

# Copia package.json y lock (si existe)
COPY package*.json ./

# Instala Angular CLI globalmente (necesario para ng build)
RUN npm install -g @angular/cli

# Instala dependencias
RUN npm install --legacy-peer-deps

# Copia el resto del proyecto
COPY . .

# Compila la aplicación Angular en modo producción
RUN npm run build -- --configuration production

# Etapa de producción
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copia los archivos compilados desde la etapa de build
COPY --from=builder /app/dist/sena-manov2/ .

# Reemplaza configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto que configuraste (10000)
EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
