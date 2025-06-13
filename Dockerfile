FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3-opencv \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Copiar SOLO requirements.txt primero (para cachear dependencias)
COPY backend/requirements.txt .

# 2. Instalar dependencias
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copiar el resto del código
COPY . .

CMD ["python", "backend/app.py"]
