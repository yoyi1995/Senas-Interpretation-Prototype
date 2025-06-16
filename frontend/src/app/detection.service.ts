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

  constructor(private http: HttpClient) {
    // URL del servidor Node.js (WebSocket)
   
  }

  detectLetter(imageData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, imageData);
  }

  sendImage(imageData: string) {
    this.socket.emit('image', imageData);
  }
}
