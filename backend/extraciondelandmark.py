import os
import cv2
import mediapipe as mp
import numpy as np
import pickle

# Configuración de MediaPipe para la detección de manos
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

# Directorio de datos
data_dir = r'C:\Users\YOYI\Downloads\asl_alphabet_train\asl_alphabet_train'
landmarks_data = []
labels = []

# Mapeo de etiquetas (A-Z + space y nothing)
label_map = {chr(i + 65): i for i in range(26)}  # Letras A-Z
label_map['space'] = 26
label_map['nothing'] = 27

# Procesar cada carpeta de letras
for label in label_map.keys():
    folder_path = os.path.join(data_dir, label)
    for img_name in os.listdir(folder_path):
        img_path = os.path.join(folder_path, img_name)
        image = cv2.imread(img_path)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)

        # Extraer landmarks si hay una mano detectada
        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
            landmarks = [coord for lm in hand_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]
            landmarks_data.append(landmarks)
            labels.append(label_map[label])

hands.close()  # Liberar recursos de MediaPipe

# Guardar los landmarks y etiquetas en un archivo
with open('landmarks_data.pkl', 'wb') as f:
    pickle.dump((landmarks_data, labels), f)

print("Extracción de landmarks completada y datos guardados en 'landmarks_data.pkl'.")
