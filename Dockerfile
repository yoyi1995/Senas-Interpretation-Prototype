FROM python:3.11-slim

# 1. Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3-opencv \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copiar requirements.txt primero
COPY backend/requirements.txt .

# 3. Instalar con estrategia de resolución de conflictos
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
    --upgrade-strategy eager \  # Fuerza actualización de paquetes conflictivos
    -r requirements.txt

# 4. Copiar el resto del código
COPY . .

CMD ["python", "backend/app.py"]
