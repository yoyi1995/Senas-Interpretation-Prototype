# Imagen base
FROM node:18

# Crear y usar directorio de trabajo
WORKDIR /app

# Copiar archivos de definición
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la app
COPY . .

# Exponer el puerto (Render usará una variable de entorno $PORT)
EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]

