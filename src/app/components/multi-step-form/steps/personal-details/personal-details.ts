import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonalFormDetails } from '../../interfaces/forms-details';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-personal-details',
  styleUrl: './personal-details.css',
  templateUrl: './personal-details.html',
  standalone: true
})
export class PersonalDetails implements OnInit {

  form!: FormGroup;
  readonly details = input<PersonalFormDetails>();
  readonly next = output<PersonalFormDetails>();
  private readonly fb = inject(FormBuilder);

  constructor() {
    effect(() => {
      const formDetails = this.details();
      if (formDetails && this.form) {
        this.form.patchValue({
          firstName: formDetails.firstName || '',
          lastName: formDetails.lastName || '',
          email: formDetails.email || '',
          phone: formDetails.phone || ''
        }, { emitEvent: false }
        );
      }
    })
  }

  ngOnInit(): void {
    const initial = this.details();
    this.form = this.fb.group({
      firstName: [initial?.firstName ?? '', [Validators.required, Validators.minLength(2)]],
      lastName: [initial?.lastName ?? '', [Validators.required, Validators.minLength(2)]],
      email: [initial?.email ?? '', [Validators.required, Validators.email]],
      phone: [initial?.phone ?? '', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,15}$/)]],
    })
  }

  onNext() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.next.emit(this.form.value as PersonalFormDetails);
  }

  get firstName() { return this.form.get('firstName')! }
  get lastName() { return this.form.get('lastName')! }
  get email() { return this.form.get('email')! }
  get phone() { return this.form.get('phone')! }

}
