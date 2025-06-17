# Imagen base
FROM node:18

# Crear directorio app
WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el resto de archivos
COPY . .

# Exponer el puerto
EXPOSE 10000

# Comando de arranque
CMD ["node", "server.js"]


