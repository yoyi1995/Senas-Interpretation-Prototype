const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('hand_landmarks', async (landmarks) => {
        try {
            const response = await axios.post('http://localhost:5001/detect', {
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

server.listen(3000, () => {
    console.log('Servidor Node.js escuchando en el puerto 3000');
});
