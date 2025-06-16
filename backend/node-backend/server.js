const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Configuración de CORS con dominio de Railway
app.use(cors({
  origin: "https://patient-exploration-front.up.railway.app",  // Frontend desplegado
  methods: ["GET", "POST"]
}));
app.use(express.json());

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3000;

// URL del backend desde variable de entorno
const BACKEND_URL = process.env.BACKEND_URL || "http://senas-interpretation-prototype-production.up.railway.app:5001";

const io = socketIo(server, {
  cors: {
    origin: "https://patient-exploration-front.up.railway.app", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('hand_landmarks', async (landmarks) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/detect`, {
        landmarks: landmarks
      });
      socket.emit('detected_letter', response.data.predicted_letter);
    } catch (error) {
      console.error('Error al procesar los landmarks:', error);
      socket.emit('error', 'Error procesando los landmarks');
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en puerto ${PORT}`); // Puerto dinámico
});
