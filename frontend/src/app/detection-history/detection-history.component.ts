// detection-history.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detection-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detection-history.component.html',
  styleUrls: ['./detection-history.component.css']
})
export class DetectionHistoryComponent {
  detectedLetters: string[] = []; // Esto está correcto
}
