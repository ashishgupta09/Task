import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalTrigger } from "./components/modal-trigger/modal-trigger";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ModalTrigger],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
