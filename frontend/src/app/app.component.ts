import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importar FormsModule
import { VideoFeedComponent } from './video-feed/video-feed.component';
import { AlphabetGuideComponent } from './alphabet-guide/alphabet-guide.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Asegúrate de que FormsModule esté aquí
    VideoFeedComponent,
    AlphabetGuideComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'senas-frontend';
  activeSection: string = 'camera'; // Para controlar la vista actual

  // Cambia entre las secciones "camera" y "alphabet"
  showSection(section: string) {
    this.activeSection = section;
    console.log(`Active Section: ${this.activeSection}`);
  }
}
