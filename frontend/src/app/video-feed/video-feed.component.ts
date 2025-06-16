import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';

// Definir interfaces para los tipos de datos
interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandResults {
  multiHandLandmarks?: MediaPipeLandmark[][];
  image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
}

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
  public detectionTimeout: any = null;
  public detectionLetter: string = '';
  public connectionStatus: string = 'Desconectado';
  public isProcessing: boolean = false;
  public connectionAttempts: number = 0;
  private MAX_CONNECTION_ATTEMPTS = 5;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.connectToServer();
    }
  }

  ngOnDestroy(): void {
    this.cleanupResources();
  }

  public connectToServer(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.connectionStatus = 'Conectando...';
    this.connectionAttempts++;
    
    this.socket = io('https://senas-interpretation-prototype-node.up.railway.app', {
      path: '/socket.io/',
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      autoConnect: true,
      withCredentials: true,
      secure: true,
      rejectUnauthorized: false
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor de señas');
      this.connectionStatus = 'Conectado';
      this.connectionAttempts = 0;
    });

    this.socket.on('detected_letter', (letter: string) => {
      if (!letter) return;
      console.log('🔠 Letra recibida:', letter);
      this.handleDetectedLetter(letter);
    });

    this.socket.on('connect_error', (err) => {
      console.error('🚨 Error de conexión:', err.message);
      this.connectionStatus = `Error: ${err.message}`;
      
      if (this.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
        this.mensaje = 'No se pudo conectar al servidor. Recargue la página.';
        this.socket.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      this.connectionStatus = 'Desconectado';
      
      if (reason === 'io server disconnect') {
        // Reconexión forzada si el servidor nos desconectó
        this.socket.connect();
      }
    });

    this.socket.on('processing_status', (status: string) => {
      this.isProcessing = status === 'processing';
    });
  }

  public handleDetectedLetter(letter: string): void {
    this.mensaje = `Letra detectada: ${letter}`;
    this.detectionLetter = letter;
    
    clearTimeout(this.detectionTimeout);
    this.detectionTimeout = setTimeout(() => {
      this.addLetterToWord(letter);
    }, 300);
  }

  public addLetterToWord(letter: string): void {
    if (this.palabra.length === 0 || this.palabra.slice(-1) !== letter) {
      this.palabra += letter;
    }
    this.mensaje = '';
    this.detectionLetter = '';
  }

  public confirmLetter(): void {
    if (this.detectionLetter) {
      this.addLetterToWord(this.detectionLetter);
    }
  }

  public clearWord(): void {
    this.palabra = '';
    this.detectionLetter = '';
    this.mensaje = '';
  }

  public confirmWord(): void {
    if (this.palabra) {
      this.speakWord(this.palabra);
    }
  }

  public speakWord(text: string): void {
    if (isPlatformBrowser(this.platformId) && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  public async onStartCamera(): Promise<void> {
    try {
      if (!this.socket.connected) {
        this.mensaje = 'Primero conecte al servidor';
        return;
      }
      await this.initCamera();
    } catch (error: any) {
      console.error('Error al iniciar cámara:', error);
      this.mensaje = 'Error al acceder a la cámara';
    }
  }

  public async initCamera(): Promise<void> {
    this.loading = true;
    try {
      await this.stopCamera();
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      await this.initMediaPipeHands();
    } catch (error: any) {
      console.error('Error al iniciar cámara:', error);
      this.mensaje = error.message || 'Error de cámara';
    } finally {
      this.loading = false;
    }
  }

  public async stopCamera(): Promise<void> {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    await this.cleanupMediaPipe();
  }

  public async cleanupMediaPipe(): Promise<void> {
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

  public cleanupResources(): void {
    this.stopCamera();
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  public initMediaPipeHands(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    this.hands.onResults((results: HandResults) => {
      try {
        if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
          // Limpiar canvas si no hay manos detectadas
          const canvas = this.canvasElement.nativeElement;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          return;
        }
        
        this.drawHands(results);
        
        if (results.multiHandLandmarks.length > 0 && this.socket?.connected) {
          this.processLandmarks(results.multiHandLandmarks);
        }
      } catch (error) {
        console.error('Error en onResults:', error);
      }
    });

    this.camera = new Camera(this.videoElement.nativeElement, {
      onFrame: async () => {
        try {
          await this.hands.send({ image: this.videoElement.nativeElement });
        } catch (error) {
          console.warn('Error enviando frame a MediaPipe:', error);
        }
      },
      width: 640,
      height: 480
    });

    this.camera.start();
  }

  public processLandmarks(landmarksArray: MediaPipeLandmark[][]): void {
    // Validación profunda de los landmarks
    if (!landmarksArray || landmarksArray.length === 0) return;

    const firstHandLandmarks = landmarksArray[0];
    if (!firstHandLandmarks) return;
    
    // Formato compatible con Flask: array de objetos {x, y, z}
    const landmarkData = firstHandLandmarks
      .filter((landmark: MediaPipeLandmark) => 
        landmark && 
        typeof landmark.x === 'number' && 
        typeof landmark.y === 'number' && 
        typeof landmark.z === 'number'
      )
      .map((landmark: MediaPipeLandmark) => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z
      }));

    if (landmarkData.length > 0 && this.socket?.connected) {
      // Enviar evento de procesamiento
      this.socket.emit('processing', true);
      
      // Enviar los landmarks
      this.socket.emit('hand_landmarks', { landmarks: landmarkData });
    }
  }
  
  public drawHands(results: HandResults): void {
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks?.length > 0) {
      this.drawLandmarks(ctx, results.multiHandLandmarks[0], canvas);
    }
  }

  public drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: MediaPipeLandmark[], canvas: HTMLCanvasElement): void {
    if (!landmarks || landmarks.length === 0) return;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20]
    ];

    ctx.fillStyle = '#FF0000'; // Rojo para puntos
    ctx.strokeStyle = '#00FF00'; // Verde para conexiones
    ctx.lineWidth = 2;

    // Dibujar puntos
    landmarks.forEach((landmark: MediaPipeLandmark) => {
      ctx.beginPath();
      ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Dibujar conexiones
    ctx.beginPath();
    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
        ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
      }
    });
    ctx.stroke();
  }
}
