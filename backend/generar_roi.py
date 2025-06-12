import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import matplotlib.pyplot as plt

# Ruta del modelo entrenado
model_path = "C:/Users/YOYI/Documents/banken-flask/modelo_landmarks.keras"
model = tf.keras.models.load_model(model_path)

# Inicializar MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

def procesar_imagen(imagen_path):
    """
    Procesa una imagen para generar el antes y después del recorte (ROI).
    """
    # Cargar imagen
    imagen = cv2.imread(imagen_path)
    imagen_rgb = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB)

    # Detectar manos con MediaPipe
    resultado = hands.process(imagen_rgb)

    if resultado.multi_hand_landmarks:
        for hand_landmarks in resultado.multi_hand_landmarks:
            # Obtener coordenadas del ROI
            h, w, c = imagen.shape
            x_min = int(min([lm.x for lm in hand_landmarks.landmark]) * w)
            y_min = int(min([lm.y for lm in hand_landmarks.landmark]) * h)
            x_max = int(max([lm.x for lm in hand_landmarks.landmark]) * w)
            y_max = int(max([lm.y for lm in hand_landmarks.landmark]) * h)

            # Recortar la región de interés (ROI)
            roi = imagen[y_min:y_max, x_min:x_max]

            # Dibujar landmarks y caja delimitadora en la imagen original
            mp_drawing.draw_landmarks(imagen, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            cv2.rectangle(imagen, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)

            # Mostrar antes y después
            plt.figure(figsize=(10, 5))

            # Imagen original con ROI marcado
            plt.subplot(1, 2, 1)
            plt.imshow(cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB))
            plt.title("Antes del Recorte")
            plt.axis("off")

            # ROI recortado
            plt.subplot(1, 2, 2)
            plt.imshow(cv2.cvtColor(roi, cv2.COLOR_BGR2RGB))
            plt.title("Después del Recorte")
            plt.axis("off")

            plt.show()
    else:
        print("No se detectaron manos en la imagen.")

# Ruta de la imagen que quieres procesar
ruta_imagen = "C:/Users/YOYI/Documents/generar roi/B468.jpg"
procesar_imagen(ruta_imagen)
