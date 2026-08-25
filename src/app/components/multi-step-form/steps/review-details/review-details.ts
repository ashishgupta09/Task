import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { FormDraftStore } from '../../data-access/form-draft-store';

@Component({
  imports: [CommonModule],
  selector: 'app-review-details',
  styleUrl: './review-details.css',
  templateUrl: './review-details.html',
  standalone: true
})
export class ReviewDetails {

  private readonly formDataService = inject(FormDraftStore);
  readonly formStare = this.formDataService.formSignalState;
  readonly fullName = this.formDataService.fullName;

  readonly submit = output<void>();
  readonly back = output<void>();

  onSubmit(): void {
    this.submit.emit()
  }

  onBack(): void {
    this.back.emit()
  }
}
