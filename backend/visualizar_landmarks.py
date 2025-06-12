import matplotlib.pyplot as plt
import numpy as np

# Simular landmarks (reemplazar con datos reales obtenidos de tu API o dataset)
landmarks_original = [
    (200, 300), (250, 350), (300, 400), (400, 450), (500, 550)  # Coordenadas originales
]
landmarks_normalized = [
    (x / 600, y / 600) for x, y in landmarks_original  # Normalización al rango [0, 1]
]

# Graficar los landmarks antes de la normalización
plt.subplot(1, 2, 1)
for x, y in landmarks_original:
    plt.scatter(x, y, color="blue")
plt.title("Antes de la Normalización")
plt.xlabel("X")
plt.ylabel("Y")
plt.grid()

# Graficar los landmarks después de la normalización
plt.subplot(1, 2, 2)
for x, y in landmarks_normalized:
    plt.scatter(x, y, color="green")
plt.title("Después de la Normalización")
plt.xlabel("X (normalizado)")
plt.ylabel("Y (normalizado)")
plt.grid()

# Mostrar la gráfica
plt.tight_layout()
plt.show()
