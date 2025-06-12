import pickle
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

# Cargar los datos de landmarks y etiquetas
with open('landmarks_data.pkl', 'rb') as f:
    landmarks_data, labels = pickle.load(f)

# Convertir los datos a arrays de NumPy
X = np.array(landmarks_data)
y = np.array(labels)

# Dividir los datos en entrenamiento y validación
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

# Definir el modelo de red neuronal
model = models.Sequential([
    layers.Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
    layers.Dense(64, activation='relu'),
    layers.Dense(29, activation='softmax')  # 29 clases
])

# Compilar el modelo
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Definir callbacks para guardar el mejor modelo y detener el entrenamiento temprano
checkpoint = ModelCheckpoint('modelo_landmarks.keras', save_best_only=True, monitor='val_loss', mode='min')
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

# Entrenar el modelo
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=50,
    batch_size=32,
    callbacks=[checkpoint, early_stopping]
)

# Evaluar el modelo
loss, accuracy = model.evaluate(X_val, y_val)
print(f"Precisión en el conjunto de validación: {accuracy * 100:.2f}%")
