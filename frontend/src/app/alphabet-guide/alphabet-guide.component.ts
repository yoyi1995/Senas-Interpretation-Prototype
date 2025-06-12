import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alphabet-guide',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Asegúrate de importar FormsModule para ngModel
  templateUrl: './alphabet-guide.component.html',
  styleUrls: ['./alphabet-guide.component.css']
})
export class AlphabetGuideComponent {
  @Input() visible: boolean = false; // Control de visibilidad
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // Array de letras A-Z
  word: string = ''; // Variable para la palabra ingresada
  signImages: string[] = []; // Array para almacenar las letras de la palabra ingresada

  // Método para generar las imágenes de las letras de la palabra
  generateSignImages() {
    this.signImages = this.word.toUpperCase().split('').filter(letter => this.alphabet.includes(letter));
  }

  // Método para obtener la ruta de la imagen de cada letra
  getLetterImage(letter: string): string {
    return `assets/Abecedario/${letter}_test.jpg`;
  }
}
