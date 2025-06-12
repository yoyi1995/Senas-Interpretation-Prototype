import pickle
import matplotlib.pyplot as plt

# Cargar el historial de entrenamiento desde el archivo
with open('historial_entrenamiento.pkl', 'rb') as f:
    historial_cargado = pickle.load(f)

# Extraer los datos de precisión y pérdida del historial cargado
accuracy = historial_cargado['accuracy']
val_accuracy = historial_cargado['val_accuracy']
loss = historial_cargado['loss']
val_loss = historial_cargado['val_loss']

# Generar los gráficos usando los datos cargados

# Gráfico de Precisión
plt.figure(figsize=(10, 5))
plt.plot(accuracy, label='Precisión en entrenamiento')
plt.plot(val_accuracy, label='Precisión en validación')
plt.xlabel('Época')
plt.ylabel('Precisión')
plt.legend()
plt.title('Precisión durante el Entrenamiento y la Validación')
plt.savefig('grafico_precision.png')
plt.show()

# Gráfico de Pérdida
plt.figure(figsize=(10, 5))
plt.plot(loss, label='Pérdida en entrenamiento')
plt.plot(val_loss, label='Pérdida en validación')
plt.xlabel('Época')
plt.ylabel('Pérdida')
plt.legend()
plt.title('Pérdida durante el Entrenamiento y la Validación')
plt.savefig('grafico_perdida.png')
plt.show()
