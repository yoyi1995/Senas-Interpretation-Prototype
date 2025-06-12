import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class DetectionService {
  private apiUrl = 'http://localhost:5000/api/detect';  // Asegúrate de que esta URL sea correcta
  public socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:5000');

    this.socket.on('detected_letter', (letter: string) => {
      console.log('Letra detectada:', letter);
    });
  }

  detectLetter(imageData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, imageData);
  }

  sendImage(imageData: string) {
    this.socket.emit('image', imageData);
  }
}
