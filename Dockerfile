FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3-opencv \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requirements.txt y modelo
COPY backend/requirements.txt .
COPY backend/modelo_landmarks.keras ./backend/

# Instalar dependencias
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

CMD ["python", "backend/app.py"]
