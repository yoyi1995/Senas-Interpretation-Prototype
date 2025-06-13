FROM python:3.11-slim

# 1. Instalar dependencias del sistema necesarias para MediaPipe
RUN apt-get update && apt-get install -y \
    python3-opencv \
    libopencv-core-dev \
    libopencv-highgui-dev \
    libopencv-imgproc-dev \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copiar solo requirements.txt primero (para mejor caché)
COPY backend/requirements.txt .

# 3. Instalar dependencias con versión flexible de MediaPipe
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. Si persiste el error, instalar MediaPipe por separado
RUN pip install mediapipe==0.10.14 --no-cache-dir

# 5. Copiar el resto del código
COPY . .

CMD ["python", "backend/app.py"]
