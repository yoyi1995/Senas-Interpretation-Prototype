import pickle

# Cargar el historial
with open('historial_entrenamiento.pkl', 'rb') as f:
    history = pickle.load(f)

# Obtener métricas cada 10 épocas
epochs = list(range(10, 51, 10))
table_data = []

for epoch in epochs:
    data = {
        'Epoch': epoch,
        'Training Accuracy': history['accuracy'][epoch-1],
        'Validation Accuracy': history['val_accuracy'][epoch-1],
        'Training Loss': history['loss'][epoch-1],
        'Validation Loss': history['val_loss'][epoch-1]
    }
    table_data.append(data)

import pandas as pd

# Crear un DataFrame para visualizar
df = pd.DataFrame(table_data)
print(df)
