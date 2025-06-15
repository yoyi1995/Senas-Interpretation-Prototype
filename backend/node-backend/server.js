const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Cambio importante: Usar la importación moderna
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Configuración para producción (Railway)
const FRONTEND_URL = 'https://patient-exploration-front.up.railway.app';
const BACKEND_URL = 'https://senas-interpretation-prototype-production.up.railway.app';

// Configuración mejorada de Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      FRONTEND_URL,
      'https://senas-interpretation-prototype-node.up.railway.app' // Añade tu propio dominio
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  // Configuración crítica para Railway:
  transports: ['websocket', 'polling'], // Habilitar ambos
  allowUpgrades: true,
  perMessageDeflate: false,
  cookie: false,
  pingTimeout: 60000,  // Aumentar timeout
  pingInterval: 25000
});

// Middleware CORS mejorado
app.use(cors({
  origin: [FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));

app.use(express.json());

// Configuración de eventos
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Manejo de errores de conexión
  socket.on('error', (error) => {
    console.error('Error en el socket:', error);
  });

  socket.on('hand_landmarks', async (landmarks) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/detect`, {
        landmarks: landmarks
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000 // Timeout para la petición al backend
      });
      socket.emit('detected_letter', response.data.predicted_letter);
    } catch (error) {
      console.error('Error al llamar al backend:', error.message);
      socket.emit('error', 'Error procesando landmarks');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Cliente desconectado:', socket.id, 'Razón:', reason);
  });
});

// Manejo de errores globales
server.on('error', (error) => {
  console.error('Error en el servidor:', error);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => { // Específica '0.0.0.0' para Railway
  console.log(`✅ Servidor Node.js escuchando en puerto ${PORT}`);
  console.log(`🟢 Frontend permitido: ${FRONTEND_URL}`);
  console.log(`🔵 Backend conectado: ${BACKEND_URL}`);
  console.log('⚡ Modo WebSocket activado');
});
