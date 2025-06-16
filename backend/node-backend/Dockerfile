# Usa una imagen oficial de Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install --production

# Copia el archivo principal
COPY server.js .

# Expone el puerto 8080 (puerto estándar de Railway)
EXPOSE 8080

# Comando para iniciar el servidor
CMD ["node", "server.js"]
