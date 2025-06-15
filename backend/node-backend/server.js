const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

// 1. Configuración inicial
const app = express();
const server = http.createServer(app);
const FRONTEND_URL = 'https://patient-exploration-front.up.railway.app';
const BACKEND_URL = 'https://senas-interpretation-prototype-production.up.railway.app';

// 2. Middleware CORS simplificado
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// 3. Configuración crítica de Socket.IO
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  },
  transports: ['websocket'], // Solo WebSocket
  pingTimeout: 60000,       // 60 segundos (Railway necesita más tiempo)
  pingInterval: 25000       // 25 segundos
});

// 4. Endpoint de salud
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    websockets: io.engine.clientsCount 
  });
});

// 5. Lógica de WebSockets (simplificada)
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('hand_landmarks', async (landmarks, callback) => {
    try {
      console.log('📡 Landmarks recibidos:', landmarks.length);
      
      const response = await axios.post(`${BACKEND_URL}/detect`, { 
        landmarks 
      }, { 
        timeout: 5000 
      });

      socket.emit('detected_letter', response.data.predicted_letter);
      callback({ status: 'success' });
    } catch (error) {
      console.error('⚠️ Error:', error.message);
      callback({ status: 'error', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// 6. Iniciar servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`🟢 Socket.IO: /socket.io/`);
  console.log(`🟢 Health check: /health`);
});
