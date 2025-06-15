const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Configuración para producción (Railway)
const FRONTEND_URL = 'https://patient-exploration-front.up.railway.app';
const BACKEND_URL = 'https://senas-interpretation-prototype-production.up.railway.app';

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket'] // Fuerza WebSocket
});

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('hand_landmarks', async (landmarks) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/detect`, {
                landmarks: landmarks
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            socket.emit('detected_letter', response.data.predicted_letter);
        } catch (error) {
            console.error('Error al llamar al backend:', error.message);
            socket.emit('error', 'Error procesando landmarks');
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor Node.js escuchando en puerto ${PORT}`);
    console.log(`🟢 Frontend permitido: ${FRONTEND_URL}`);
    console.log(`🔵 Backend conectado: ${BACKEND_URL}`);
});
