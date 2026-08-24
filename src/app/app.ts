import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EmployeePage } from "./components/data-passing/employee-page/employee-page";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmployeePage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
