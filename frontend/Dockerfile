# Etapa de construcción
FROM node:18 AS builder
WORKDIR /app

# Instala Angular CLI y dependencias
COPY package*.json ./
RUN npm install -g @angular/cli && \
    npm ci --legacy-peer-deps

# Copia código y construye
COPY . .
COPY tsconfig.app.json ./tsconfig.app.json
COPY tsconfig.json ./tsconfig.json

# Build con memoria limitada
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN ng build --configuration production

# Etapa de producción
FROM nginx:alpine
COPY --from=builder /app/dist/senas-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
