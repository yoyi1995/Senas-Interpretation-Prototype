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
  private detectionLetter: string = '';

  ngOnInit() {
    this.connectToServer();
  }

  /** Conecta con el servidor de Socket.IO */
  connectToServer() {
    this.socket = io('https://node-flas.onrender.com');

    this.socket.on('connect', () => {
      console.log('✅ Conexión exitosa al servidor');
    });

    this.socket.on('detected_letter', (letter: string) => {
      this.mensaje = `Letra detectada: ${letter}`;
      this.detectionLetter = letter;

      if (this.detectionTimeout) {
        clearTimeout(this.detectionTimeout);
      }

      this.detectionTimeout = setTimeout(() => {
        this.addLetterToWord(letter);
      }, 298);
    });
  }

  /** Agrega una letra a la palabra si no es duplicada */
  addLetterToWord(letter: string) {
    if (this.palabra.length === 0 || this.palabra.slice(-1) !== letter) {
      this.palabra += letter;
    }

    this.mensaje = '';
    this.detectionLetter = '';
  }

  /** Confirma manualmente una letra */
  confirmLetter() {
    if (this.detectionLetter) {
      this.addLetterToWord(this.detectionLetter);
    }
  }

  /** Reproduce la palabra detectada por síntesis de voz */
  confirmWord() {
    if (this.palabra) {
      this.speakWord(this.palabra);
    }
  }

  /** Usa la síntesis de voz del navegador */
  speakWord(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('❌ Tu navegador no soporta la síntesis de voz.');
    }
  }

  /** Inicia el flujo de la cámara */
  onStartCamera() {
    this.initCamera();
  }

  /** Inicializa el flujo de video y la detección */
  async initCamera() {
    this.loading = true;

    try {
      this.stopCamera(); // Asegura que no haya una cámara activa previa

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = stream;
      this.stream = stream;

      this.initMediaPipeHands();
    } catch (error) {
      console.error('❌ Error al acceder a la cámara:', error);
    } finally {
      this.loading = false;
    }
  }

  /** Detiene la cámara y limpia recursos */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }

    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }

    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }

    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /** Inicializa MediaPipe Hands */
  initMediaPipeHands() {
    this.hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

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

  /** Dibuja la mano detectada y conexiones en el canvas */
  drawHands(results: any) {
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
          ctx.fill();
        }

        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [0, 9], [9, 10], [10, 11], [11, 12],
          [0, 13], [13, 14], [14, 15], [15, 16],
          [0, 17], [17, 18], [18, 19], [19, 20]
        ];

        ctx.beginPath();
        for (const [start, end] of connections) {
          ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
          ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
        }
        ctx.stroke();
      }
    }
  }

  /** Envía landmarks al servidor */
  sendLandmarksToServer(landmarks: any) {
    const flatData = landmarks.flatMap((pt: any) => [pt.x, pt.y, pt.z]);
    this.socket.emit('hand_landmarks', flatData);
  }
}


