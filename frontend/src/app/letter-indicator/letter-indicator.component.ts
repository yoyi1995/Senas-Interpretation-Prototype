// letter-indicator.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-letter-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-indicator.component.html',
  styleUrls: ['./letter-indicator.component.css']
})
export class LetterIndicatorComponent {
  @Input() detectedLetter: string | null = null; // Propiedad de entrada

  // Método para actualizar la letra detectada
  updateLetter(letter: string) {
    this.detectedLetter = letter; // Actualiza la propiedad detectedLetter
  }
}
