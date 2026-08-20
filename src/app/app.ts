import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Password } from "./components/password/password";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Password],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
