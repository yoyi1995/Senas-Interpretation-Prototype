# Usa una imagen base de Python
FROM python:3.9-slim

# Directorio de trabajo
WORKDIR /app

# Copia requerimientos y modelo
COPY requirements.txt .
COPY modelo_landmarks.keras ./modelo_landmarks.keras  # Asegura que el modelo esté incluido

# Instala dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código del backend
COPY app.py .

# Expone el puerto 5001 (usado en Railway)
EXPOSE 5001

# Comando para iniciar la aplicación con Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5001", "app:app"]
