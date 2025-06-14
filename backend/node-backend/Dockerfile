# Usa la imagen oficial de Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install --production

# Copia el resto de archivos
COPY server.js .

# Expone el puerto 3000 (Socket.io)
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]
