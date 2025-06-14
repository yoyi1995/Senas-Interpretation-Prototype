const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Configuración para producción
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('hand_landmarks', async (landmarks) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/detect`, {
                landmarks: landmarks
            });
            socket.emit('detected_letter', response.data.predicted_letter);
        } catch (error) {
            console.error('Error:', error);
            socket.emit('error', 'Error procesando landmarks');
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor Node.js escuchando en el puerto ${PORT}`);
});
