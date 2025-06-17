# Usar una versión compatible de Python
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
COPY modelo_landmarks.keras ./modelo_landmarks.keras
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 5001
CMD ["gunicorn", "-b", "0.0.0.0:5001", "app:app"]
