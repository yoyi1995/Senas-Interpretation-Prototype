const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// URL del microservicio Flask que hace la detección (ajusta si es diferente)
const BACKEND_URL = process.env.BACKEND_URL || "https://senas-interpretation-prototype.onrender.com";

// CORS para aceptar solo tu frontend en Render
app.use(cors({
  origin: "https://sena-frontend.onrender.com", // tu frontend real en Render
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Socket.IO con CORS
const io = socketIo(server, {
  cors: {
    origin: "https://sena-frontend.onrender.com",
    methods: ["GET", "POST"]
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado');

  socket.on('hand_landmarks', async (landmarks) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/detect`, {
        landmarks: landmarks
      });
      socket.emit('detected_letter', response.data.predicted_letter);
    } catch (error) {
      console.error('❌ Error al procesar los landmarks:', error.message);
      socket.emit('error', 'Error procesando los landmarks');
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado');
  });
});

// Escucha dinámica para Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});

