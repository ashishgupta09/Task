import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MultiStepFormPage } from "./components/multi-step-form/multi-step-form-page/multi-step-form-page";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MultiStepFormPage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
