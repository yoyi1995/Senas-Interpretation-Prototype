# Usa una imagen oficial de Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./

# Instala solo dependencias necesarias para producción
RUN npm install --production

# Copia el resto de archivos del proyecto
COPY . .

# Expone el puerto dinámico usado en el server.js
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]
