FROM python:3.11-slim

# 1. Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3-opencv \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copiar requirements.txt primero
COPY backend/requirements.txt .

# 3. Instalar dependencias (formato corregido)
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
    --upgrade-strategy eager \
    -r requirements.txt

# 4. Copiar el resto del código
COPY . .

CMD ["python", "backend/app.py"]
