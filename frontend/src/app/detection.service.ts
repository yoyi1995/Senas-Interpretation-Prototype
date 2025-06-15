import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class DetectionService {
  // URL del backend Flask (API)
  private apiUrl = 'https://senas-interpretation-prototype-production.up.railway.app/api/detect';
  
  public socket: Socket;

  constructor(private http: HttpClient) {
    // URL del servidor Node.js (WebSocket)
    this.socket = io('https://senas-interpretation-prototype-node.up.railway.app', {
      transports: ['websocket'], // Obligatorio en producción
      secure: true, // Usar HTTPS
      withCredentials: true
    });

    this.socket.on('detected_letter', (letter: string) => {
      console.log('Letra detectada:', letter);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Error de conexión Socket.io:', err);
    });
  }

  detectLetter(imageData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, imageData);
  }

  sendImage(imageData: string) {
    this.socket.emit('image', imageData);
  }
}
