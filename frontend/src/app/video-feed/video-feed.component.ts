import { Component, ViewChild, ElementRef } from '@angular/core';
import { io, Socket } from 'socket.io-client';

declare var Hands: any;
declare var Camera: any;

@Component({
  selector: 'app-video-feed',
  standalone: true,
  templateUrl: './video-feed.component.html',
  styleUrls: ['./video-feed.component.css']
})
export class VideoFeedComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  public stream: MediaStream | null = null;  
  private socket!: Socket;
  mensaje: string = '';  
  palabra: string = '';  
  hands: any;
  camera: any;
  loading: boolean = false;

  private detectionTimeout: any = null;
  private detectionLetter: string = '';  // Almacena la última letra detectada

  // Conecta al servidor de Socket.IO
  connectToServer() {
    this.socket = io('https://node-flas.onrender.com');

    this.socket.on('connect', () => {
      console.log('Conexión exitosa al servidor');
    });

    // Escucha el evento de detección de letra desde el servidor
   let repeatedLetterCount = 0;

this.socket.on('detected_letter', (letter: string) => {
  if (letter === this.detectionLetter) {
    repeatedLetterCount++;
    if (repeatedLetterCount > 3) return; // Evita seguir mostrando la misma letra
  } else {
    repeatedLetterCount = 0;
  }

  this.detectionLetter = letter;
  this.mensaje = `Letra detectada: ${letter}`;

  if (this.detectionTimeout) {
    clearTimeout(this.detectionTimeout);
  }

  this.detectionTimeout = setTimeout(() => {
    this.addLetterToWord(letter);
  }, 300);
});

  }

  // Agrega la letra detectada a la palabra en construcción
  addLetterToWord(letter: string) {
    // Verifica que la letra actual no sea la misma que la última registrada para evitar duplicados
    if (this.palabra.length === 0 || this.palabra.slice(-1) !== letter) {
      this.palabra += letter;
    }
  
    this.mensaje = '';  // Limpia el mensaje mostrado
    this.detectionLetter = '';  // Reinicia la letra detectada
  }

  // Confirma manualmente la letra detectada y la agrega a la palabra
  confirmLetter() {
    if (this.detectionLetter) {
      this.addLetterToWord(this.detectionLetter);
    }
  }

  // Reproduce la palabra construida usando síntesis de voz
  confirmWord() {
    if (this.palabra) {
      this.speakWord(this.palabra);
    }
  }

  // Convierte la palabra en audio usando la API de síntesis de voz
  speakWord(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Tu navegador no soporta la síntesis de voz.");
    }
  }

  // Inicia la cámara y configura el procesamiento de la detección de manos
  onStartCamera() {
    this.initCamera();
  }

  // Inicia la cámara y el procesamiento de imágenes usando MediaPipe
  async initCamera() {
    this.loading = true;  
    try {
      this.stopCamera();  // Detiene cualquier flujo de cámara previo
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = stream;
      this.stream = stream;
      this.initMediaPipeHands();  // Configura MediaPipe Hands
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    } finally {
      this.loading = false;  
    }
  }

  // Detiene la cámara y limpia los recursos
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('Cámara detenida');
    }

    this.videoElement.nativeElement.srcObject = null;

    if (this.hands) {
      this.hands.close();
      this.hands = null;
      console.log('MediaPipe Hands detenido');
    }

    if (this.camera) {
      this.camera.stop();
      this.camera = null;
      console.log('Objeto camera detenido');
    }

    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Inicializa el componente de detección de manos de MediaPipe
  initMediaPipeHands() {
    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    // Procesa los resultados de detección y envía las coordenadas al servidor
    this.hands.onResults((results: any) => {
      this.drawHands(results);
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          this.sendLandmarksToServer(landmarks);
        }
      }
    });

    this.camera = new Camera(this.videoElement.nativeElement, {
      onFrame: async () => {
        await this.hands.send({ image: this.videoElement.nativeElement });
      },
      width: 640,
      height: 480
    });

    this.camera.start();
  }

  // Dibuja las manos y sus conexiones en el canvas
  drawHands(results: any) {
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        context.fillStyle = 'red';
        context.strokeStyle = 'red';
        context.lineWidth = 2;

        // Dibuja cada punto de referencia de la mano
        for (const landmark of landmarks) {
          context.beginPath();
          context.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
          context.fill();
        }

        // Dibuja conexiones entre puntos de la mano
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [0, 9], [9, 10], [10, 11], [11, 12],
          [0, 13], [13, 14], [14, 15], [15, 16],
          [0, 17], [17, 18], [18, 19], [19, 20]
        ];

        context.beginPath();
        for (const [start, end] of connections) {
          context.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
          context.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
        }
        context.stroke();
      }
    }
  }

  // Envía los datos de las coordenadas de las manos al servidor
 private lastLandmarks: number[] | null = null;
private lastSentTime = 0;

sendLandmarksToServer(landmarks: any) {
  const now = Date.now();
  if (now - this.lastSentTime < 400) return; // Espera al menos 400ms antes de enviar de nuevo
  this.lastSentTime = now;

  const landmarkData = landmarks.flatMap((landmark: any) => [
    landmark.x,
    landmark.y,
    landmark.z
  ]);

  // Compara con los últimos enviados para evitar redundancia
  if (this.areLandmarksSimilar(landmarkData, this.lastLandmarks)) return;

  this.lastLandmarks = landmarkData;
  this.socket.emit('hand_landmarks', landmarkData);
}

areLandmarksSimilar(a: number[] | null, b: number[] | null): boolean {
  if (!a || !b || a.length !== b.length) return false;
  const threshold = 0.01;
  return a.every((val, i) => Math.abs(val - b[i]) < threshold);
}

}

