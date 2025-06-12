from tensorflow.keras.utils import plot_model
from tensorflow.keras.models import load_model
from IPython.display import Image, display

# Ruta al modelo entrenado
model_path = "C:/Users/YOYI/Documents/banken-flask/modelo_landmarks.keras"

# Cargar el modelo
model = load_model(model_path)

# Generar el diagrama del modelo
plot_model(
    model,
    to_file="modelo_temporal_diagrama.png",
    show_shapes=True,
    show_layer_names=True,
)

# Mostrar el diagrama generado
print("El diagrama del modelo ha sido generado.")
try:
    display(Image(filename="modelo_temporal_diagrama.png"))
except FileNotFoundError:
    print("No se pudo encontrar el archivo del diagrama generado.")

