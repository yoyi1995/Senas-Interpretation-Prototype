import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';

declare var Hands: any;
declare var Camera: any;

@Component({
  selector: 'app-video-feed',
  standalone: true,
  templateUrl: './video-feed.component.html',
  styleUrls: ['./video-feed.component.css']
})
export class VideoFeedComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  public stream: MediaStream | null = null;
  public socket!: Socket;
  public mensaje: string = '';
  public palabra: string = '';
  public hands: any;
  public camera: any;
  public loading: boolean = false;
  private detectionTimeout: any = null;
  private detectionLetter: string = '';

  ngOnInit() {
    this.connectToServer();
  }

  ngOnDestroy() {
    this.cleanupResources();
  }

  // Conexión WebSocket (pública para el template)
  public connectToServer() {
    this.socket = io('https://senas-interpretation-prototype-node.up.railway.app', {
      path: '/socket.io/',
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor de señas');
    });

    this.socket.on('detected_letter', (letter: string) => {
      if (!letter) return;
      console.log('🔠 Letra recibida:', letter);
      this.handleDetectedLetter(letter);
    });

    this.socket.on('connect_error', (err) => {
      console.error('🚨 Error de conexión:', err.message);
    });
  }

  private handleDetectedLetter(letter: string) {
    this.mensaje = `Letra detectada: ${letter}`;
    this.detectionLetter = letter;
    
    clearTimeout(this.detectionTimeout);
    this.detectionTimeout = setTimeout(() => {
      this.addLetterToWord(letter);
    }, 300);
  }

  public addLetterToWord(letter: string) {
    if (this.palabra.length === 0 || this.palabra.slice(-1) !== letter) {
      this.palabra += letter;
    }
    this.mensaje = '';
    this.detectionLetter = '';
  }

  // Métodos UI públicos
  public confirmLetter() {
    if (this.detectionLetter) {
      this.addLetterToWord(this.detectionLetter);
    }
  }

  public confirmWord() {
    if (this.palabra) {
      this.speakWord(this.palabra);
    }
  }

  public speakWord(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Gestión de cámara
  public async onStartCamera() {
    try {
      await this.initCamera();
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      this.mensaje = 'Error al acceder a la cámara';
    }
  }

  public async initCamera() {
    this.loading = true;
    try {
      await this.stopCamera();
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480 
        } 
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      await this.initMediaPipeHands();
    } finally {
      this.loading = false;
    }
  }

  public async stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    await this.cleanupMediaPipe();
  }

  public async cleanupMediaPipe() {
    if (this.hands) {
      try {
        this.hands.close();
      } catch (e) {
        console.warn('Error cerrando MediaPipe Hands:', e);
      }
      this.hands = null;
    }
    if (this.camera) {
      try {
        this.camera.stop();
      } catch (e) {
        console.warn('Error cerrando Camera:', e);
      }
      this.camera = null;
    }
  }

  public cleanupResources() {
    this.stopCamera();
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  // MediaPipe Hands
  public initMediaPipeHands() {
    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    this.hands.onResults((results: any) => {
      this.drawHands(results);
      if (results.multiHandLandmarks && this.socket?.connected) {
        this.processLandmarks(results.multiHandLandmarks);
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

  public processLandmarks(landmarksArray: any[]) {
    const landmarks = landmarksArray[0]; // Solo primera mano
    const landmarkData = landmarks.map((landmark: any) => [
      landmark.x,
      landmark.y,
      landmark.z
    ]).flat();

    this.socket.emit('hand_landmarks', landmarkData);
  }

  public drawHands(results: any) {
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      this.drawLandmarks(ctx, results.multiHandLandmarks[0], canvas);
    }
  }

  private drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20]
    ];

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    // Dibuja puntos
    landmarks.forEach((landmark: any) => {
      ctx.beginPath();
      ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Dibuja conexiones
    ctx.beginPath();
    connections.forEach(([start, end]) => {
      ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
      ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
    });
    ctx.stroke();
  }
}
