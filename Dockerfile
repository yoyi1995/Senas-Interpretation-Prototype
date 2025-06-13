# Usa la imagen oficial de Python 3.10
FROM python:3.10-slim

# Crea y selecciona el directorio de trabajo
WORKDIR /app

# Copia TODO tu proyecto al contenedor
COPY . .

# Instala dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Comando para ejecutar tu aplicación (ajusta "app.py" al nombre de tu archivo principal)
CMD ["python", "backend/app.py"]
