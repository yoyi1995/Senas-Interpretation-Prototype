FROM python:3.11-slim  # Asegúrate de usar una versión válida
WORKDIR /app
COPY requirements.txt .
COPY modelo_landmarks.keras ./modelo_landmarks.keras  # Ruta corregida
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 5001
CMD ["gunicorn", "-b", "0.0.0.0:5001", "app:app"]
