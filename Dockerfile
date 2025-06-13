FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3-opencv \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Instalar dependencias de Python
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "backend/app.py"]  # Ajusta a tu archivo principal
