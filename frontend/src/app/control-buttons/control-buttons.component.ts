import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-control-buttons',
  standalone: true,
  templateUrl: './control-buttons.component.html',
  styleUrls: ['./control-buttons.component.css']
})
export class ControlButtonsComponent {
  @Output() startDetection = new EventEmitter<void>();
  @Output() pauseDetection = new EventEmitter<void>();
  @Output() stopDetection = new EventEmitter<void>();

  onStart() {
    console.log('Botón iniciar presionado');
    this.startDetection.emit();
  }

  onPause() {
    console.log('Botón pausar presionado');
    this.pauseDetection.emit();
  }

  onStop() {
    console.log('Botón detener presionado');
    this.stopDetection.emit();
  }
}
