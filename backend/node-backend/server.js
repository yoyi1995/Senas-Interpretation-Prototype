const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Configuración para producción (Railway)
const FRONTEND_URL = 'https://patient-exploration-front.up.railway.app';
const BACKEND_URL = 'https://senas-interpretation-prototype-production.up.railway.app';
const NODE_ENV = process.env.NODE_ENV || 'production';

// Debug inicial
console.log('⚙️  Entorno:', NODE_ENV);
console.log('🌐 Frontend URL:', FRONTEND_URL);
console.log('🔌 Backend URL:', BACKEND_URL);

// Configuración mejorada de Socket.io
const io = new Server(server, {
  cors: {
    origin: NODE_ENV === 'development' 
      ? ['http://localhost:4200', FRONTEND_URL]
      : [FRONTEND_URL],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Length']
  },
  // Configuración optimizada para Railway
  transports: ['websocket', 'polling'],
  allowEIO3: true, // Compatibilidad con versiones anteriores
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutos
    skipMiddlewares: true
  },
  pingTimeout: 30000,
  pingInterval: 10000,
  cookie: NODE_ENV === 'production' ? {
    name: 'io',
    path: '/',
    httpOnly: true,
    sameSite: 'none',
    secure: true
  } : false
});

// Middleware CORS mejorado
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? ['http://localhost:4200', FRONTEND_URL] 
    : FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Endpoint de salud crítico para Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    websocketClients: io.engine.clientsCount
  });
});

// Configuración de eventos de Socket.io
io.on('connection', (socket) => {
  console.log('🔗 Cliente conectado:', socket.id);

  socket.on('hand_landmarks', async (landmarks, callback) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/detect`, {
        landmarks: landmarks
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 8000 // Timeout aumentado
      });

      socket.emit('detected_letter', response.data.predicted_letter);
      callback({ status: 'success' });
    } catch (error) {
      console.error('⚠️ Error al llamar al backend:', error.message);
      
      if (error.response) {
        console.error('📊 Respuesta del backend:', error.response.data);
      }

      socket.emit('error', {
        message: 'Error procesando landmarks',
        code: error.code || 'UNKNOWN_ERROR'
      });
      
      callback({ 
        status: 'error',
        error: error.message 
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Cliente desconectado:', socket.id, 'Razón:', reason);
  });

  socket.on('error', (error) => {
    console.error('💥 Error en el socket:', error);
  });
});

// Manejo de errores globales
server.on('error', (error) => {
  console.error('🔥 Error crítico en el servidor:', error);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor Node.js escuchando en puerto ${PORT}`);
  console.log(`🟢 Frontend permitido: ${FRONTEND_URL}`);
  console.log(`🔵 Backend conectado: ${BACKEND_URL}`);
  console.log('⚡ WebSockets configurados correctamente');
  console.log('📡 Modo:', NODE_ENV.toUpperCase());
  console.log('⏱️  Timeout:', io.engine.opts.pingTimeout / 1000 + 's');
  console.log('🔄 Intervalo de ping:', io.engine.opts.pingInterval / 1000 + 's\n');
});

// Manejo de señales para Railway
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});
