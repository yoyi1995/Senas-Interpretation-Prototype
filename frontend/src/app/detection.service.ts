import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class DetectionService {
  // URL del backend Flask (API)
 
  
  public socket: Socket;
#private apiUrl = 'https://backen-flas.onrender.com/detect';  // URL del endpoint Flask
  constructor(private http: HttpClient) {
    // URL del servidor Node.js (WebSocket)
    #this.socket = io('https://node-flas.onrender.com'); // conectar al WebSocket
  }

  detectLetter(imageData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, imageData);
  }

  sendImage(imageData: string) {
    this.socket.emit('image', imageData);
  }
}
