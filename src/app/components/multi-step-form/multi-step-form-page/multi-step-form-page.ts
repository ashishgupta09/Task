import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormDraftStore } from '../data-access/form-draft-store';
import { PersonalFormDetails } from '../interfaces/forms-details';
import { PersonalDetails } from '../steps/personal-details/personal-details';
import { EditDetails } from '../steps/edit-details/edit-details';
import { ReviewDetails } from '../steps/review-details/review-details';

@Component({
  imports: [CommonModule, PersonalDetails, EditDetails, ReviewDetails],
  selector: 'app-multi-step-form-page',
  styleUrl: './multi-step-form-page.css',
  templateUrl: './multi-step-form-page.html',
  standalone: true
})
export class MultiStepFormPage {

  submitted = false;
  private readonly formDraftStore = inject(FormDraftStore);
  readonly currentStep = this.formDraftStore.currentStep;

  readonly personalDetails = computed(
    () => this.formDraftStore.formSignalState().personalDetails
  )

  onStepClick(step: number): void {
    if (step < this.currentStep()) {
      this.formDraftStore.goToStep(step)
    }
  }

  onStep1Next(details: PersonalFormDetails): void {
    this.formDraftStore.updatePersonalDetails(details);
    this.formDraftStore.goToStep(2);
  }

  onStep2Next(details: PersonalFormDetails) {
    this.formDraftStore.updatePersonalDetails(details);
    this.formDraftStore.goToStep(3);
  }

  onStep2Back(details: PersonalFormDetails) {
    if (details) {
      this.formDraftStore.updatePersonalDetails(details)
    }
    this.formDraftStore.goToStep(1);
  }

  onSubmit() {
    this.formDraftStore.submit();
    this.submitted = true;
  }

  onStep3Back() {
    this.formDraftStore.goToStep(2);
  }

  onReset() {
    this.formDraftStore.reset();
    this.submitted = false;
  }

}
