import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Cargar el modelo desde una ruta relativa (evita rutas absolutas)
model_path = os.path.join(os.path.dirname(__file__), 'modelo_landmarks.keras')
model = tf.keras.models.load_model(model_path)

def detect_letter(landmarks):
    # Validar longitud de landmarks (21 puntos * 3 coordenadas = 63 valores)
    if len(landmarks) != 63:
        raise ValueError(f"Se esperan 63 valores, pero se recibieron {len(landmarks)}")
    
    # Redimensionar datos de entrada
    input_data = np.array(landmarks).reshape(1, -1)
    
    # Predicción del modelo
    predictions = model.predict(input_data)
    predicted_letter_index = np.argmax(predictions)
    
    # Mapeo de índice a letra (ajusta según tu dataset)
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return letters[predicted_letter_index]

@app.route('/detect', methods=['POST'])
def detect():
    try:
        landmarks = request.json.get('landmarks')
        if not landmarks:
            return jsonify({'error': 'No se recibieron landmarks'}), 400
        
        predicted_letter = detect_letter(landmarks)
        return jsonify({'predicted_letter': predicted_letter})
    
    except Exception as e:
        app.logger.error(f"Error procesando landmarks: {str(e)}")
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

if __name__ == '__main__':
    # Escucha en 0.0.0.0 para permitir conexiones externas
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
