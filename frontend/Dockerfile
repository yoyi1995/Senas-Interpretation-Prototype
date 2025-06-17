# Etapa de construcción
FROM node:18 AS builder
WORKDIR /app

# Copia dependencias y herramientas
COPY package*.json ./
RUN npm install -g @angular/cli && \
    npm ci --legacy-peer-deps

# Copia archivos críticos para el build
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.app.json ./tsconfig.app.json

# Copia el resto del proyecto
COPY . .

# Build con opciones específicas
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN ng build --configuration production --output-path=dist --output-hashing=none
