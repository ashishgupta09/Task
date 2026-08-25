import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonalFormDetails } from '../../interfaces/forms-details';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-edit-details',
  styleUrl: './edit-details.css',
  templateUrl: './edit-details.html',
  standalone: true,
})
export class EditDetails {

  readonly details = input.required<PersonalFormDetails>();
  readonly next = output<PersonalFormDetails>();
  readonly back = output<PersonalFormDetails>();
  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,15}$/)]],
  })

  constructor() {
    effect(() => {
      const formDetails = this.details();
      if (formDetails) {
        this.form.patchValue({
          firstName: formDetails.firstName || '',
          lastName: formDetails.lastName || '',
          email: formDetails.email || '',
          phone: formDetails.phone || '',
        }, { emitEvent: false }
        )
      }
    })
  }

  onNext() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return
    }
    this.next.emit(this.form.value as PersonalFormDetails)
  }

  onBack() {
    this.back.emit(this.form.value as PersonalFormDetails)
  }

  get firstName() { return this.form.get('firstName')! };
  get lastName() { return this.form.get('lastName')! }
  get email() { return this.form.get('email')! }
  get phone() { return this.form.get('phone')! }
  
}
