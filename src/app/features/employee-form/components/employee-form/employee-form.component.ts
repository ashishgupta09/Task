import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  EmployeeRegistrationModel,
  EmploymentType,
  Gender,
} from '../../models/employee.model';
import { EmployeeFormService } from '../../services/employee-form.service';
import {
  employeeIdValidator,
  minOneRecordValidator,
  passwordMatchValidator,
  phoneNumberValidator,
  profilePictureValidator,
  workExperienceDateRangeValidator,
} from '../../validators/custom-validators';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly nonNullableBuilder = inject(NonNullableFormBuilder);
  private readonly employeeFormService = inject(EmployeeFormService);
  private readonly router = inject(Router);

  readonly submitted = signal(false);
  readonly formSaved = signal(false);
  readonly genders = this.employeeFormService.genders;
  readonly departments = this.employeeFormService.departments;
  readonly employmentTypes = this.employeeFormService.employmentTypes;
  readonly workLocations = this.employeeFormService.workLocations;
  readonly countries = this.employeeFormService.countries;
  readonly accountStatuses = this.employeeFormService.accountStatuses;
  readonly skillLevels = this.employeeFormService.skillLevels;
  readonly stateOptions = signal<string[]>(this.employeeFormService.getStatesForCountry('India'));

  readonly form = this.formBuilder.group({
    personalInfo: this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      middleName: ['', [Validators.nullValidator, Validators.maxLength(30)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(80)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s()-]{10,15}$/), phoneNumberValidator]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['Male' as Gender, [Validators.required]],
      profilePicture: [null as File | null, [Validators.required, profilePictureValidator]],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      country: ['India', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4,8}$/)]],
    }),
    professionalInfo: this.formBuilder.group({
      employeeId: [
        '',
        {
          validators: [Validators.required, Validators.minLength(4), employeeIdValidator],
          asyncValidators: [Validators.composeAsync([this.employeeFormService.employeeIdAsyncValidator()])],
          updateOn: 'blur',
        },
      ],
      department: ['Engineering', [Validators.required]],
      designation: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      joiningDate: ['', [Validators.required]],
      employmentType: ['Full Time' as EmploymentType, [Validators.required]],
      workLocation: ['Hybrid', [Validators.required]],
      reportingManager: ['', [Validators.required, Validators.minLength(2)]],
      salary: [0, [Validators.required, Validators.min(150000), Validators.max(5000000)]],
      yearsOfExperience: [0, [Validators.required, Validators.min(0), Validators.max(40)]],
      contractEndDate: [''],
    }),
    educationDetails: this.formBuilder.array([this.createEducationGroup()], {
      validators: [minOneRecordValidator],
    }),
    workExperience: this.formBuilder.array([this.createWorkExperienceGroup()], {
      validators: [minOneRecordValidator],
    }),
    skills: this.formBuilder.array([this.createSkillGroup()], {
      validators: [minOneRecordValidator],
    }),
    accountInformation: this.formBuilder.group(
      {
        username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(32),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/),
          ]),
        ],
        confirmPassword: ['', [Validators.required]],
        accountStatus: ['Active', [Validators.required]],
        termsAndConditions: [false, [Validators.requiredTrue]],
      },
      { validators: [passwordMatchValidator] },
    ),
  });

  readonly nonNullableDemoForm = this.nonNullableBuilder.group({
    projectStage: ['draft' as const, [Validators.required]],
    milestoneCount: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.syncContractValidation();
    this.form.get('professionalInfo.employmentType')?.valueChanges.subscribe(() => {
      this.syncContractValidation();
    });

    this.form.get('personalInfo.country')?.valueChanges.subscribe(() => {
      this.syncStateOptions();
    });

    this.form.get('skills')?.valueChanges.subscribe(() => {
      this.validateDuplicateSkills();
    });
  }

  get educationDetails(): FormArray {
    return this.form.get('educationDetails') as FormArray;
  }

  get workExperience(): FormArray {
    return this.form.get('workExperience') as FormArray;
  }

  get skills(): FormArray {
    return this.form.get('skills') as FormArray;
  }

  getSummaryText(control: AbstractControl | null): string {
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address.';
    }

    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength}.`;
    }

    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength}.`;
    }

    if (control.errors['pattern']) {
      return 'Value does not match the expected format.';
    }

    if (control.errors['invalidPhoneNumber']) {
      return 'Phone number must contain 10-15 digits with an optional country code.';
    }

    if (control.errors['invalidEmployeeId']) {
      return 'Employee ID must match the pattern like EMP-1234.';
    }

    if (control.errors['fileTooLarge']) {
      return 'Profile picture must be under 2 MB.';
    }

    if (control.errors['invalidFileType']) {
      return 'Only PNG, JPG, or WEBP images are supported.';
    }

    if (control.errors['passwordMismatch']) {
      return 'Password and confirm password do not match.';
    }

    if (control.errors['invalidDateRange']) {
      return 'End date must be on or after the start date.';
    }

    if (control.errors['duplicateSkill']) {
      return 'Skill names must be unique.';
    }

    if (control.errors['employeeIdTaken']) {
      return 'This employee ID is already in use.';
    }

    return 'Please correct this field.';
  }

  addEducation(): void {
    this.educationDetails.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    if (this.educationDetails.length > 1) {
      this.educationDetails.removeAt(index);
    }
  }

  addWorkExperience(): void {
    this.workExperience.push(this.createWorkExperienceGroup());
  }

  removeWorkExperience(index: number): void {
    if (this.workExperience.length > 1) {
      this.workExperience.removeAt(index);
    }
  }

  addSkill(): void {
    this.skills.push(this.createSkillGroup());
  }

  removeSkill(index: number): void {
    if (this.skills.length > 1) {
      this.skills.removeAt(index);
    }
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.form.get('personalInfo.profilePicture')?.setValue(file);
    this.form.get('personalInfo.profilePicture')?.markAsTouched();
    this.form.get('personalInfo.profilePicture')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }

    const payload = this.form.getRawValue() as EmployeeRegistrationModel;
    console.log('Employee form payload', payload);
    this.formSaved.set(true);
    this.form.reset();
    this.stateOptions.set(this.employeeFormService.getStatesForCountry('India'));
    this.form.patchValue({
      personalInfo: {
        country: 'India',
        gender: 'Male',
      },
      professionalInfo: {
        department: 'Engineering',
        employmentType: 'Full Time',
        workLocation: 'Hybrid',
      },
      accountInformation: {
        accountStatus: 'Active',
      },
    });
  }

  resetForm(): void {
    this.formSaved.set(false);
    this.submitted.set(false);
    this.form.reset({
      personalInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: 'Male',
        profilePicture: null,
        address: '',
        country: 'India',
        state: '',
        city: '',
        pinCode: '',
      },
      professionalInfo: {
        employeeId: '',
        department: 'Engineering',
        designation: '',
        joiningDate: '',
        employmentType: 'Full Time',
        workLocation: 'Hybrid',
        reportingManager: '',
        salary: 0,
        yearsOfExperience: 0,
        contractEndDate: '',
      },
      educationDetails: [this.createEducationGroup()],
      workExperience: [this.createWorkExperienceGroup()],
      skills: [this.createSkillGroup()],
      accountInformation: {
        username: '',
        password: '',
        confirmPassword: '',
        accountStatus: 'Active',
        termsAndConditions: false,
      },
    });
    this.stateOptions.set(this.employeeFormService.getStatesForCountry('India'));
  }

  private createEducationGroup(): FormGroup {
    return this.formBuilder.group({
      qualification: ['', [Validators.required]],
      university: ['', [Validators.required, Validators.minLength(3)]],
      passingYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear() + 5)]],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      grade: ['', [Validators.required]],
    });
  }

  private createWorkExperienceGroup(): FormGroup {
    return this.formBuilder.group(
      {
        companyName: ['', [Validators.required, Validators.minLength(2)]],
        jobTitle: ['', [Validators.required]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        currentlyWorking: [false],
        responsibilities: ['', [Validators.required, Validators.minLength(10)]],
      },
      { validators: [workExperienceDateRangeValidator] },
    );
  }

  private createSkillGroup(): FormGroup {
    return this.formBuilder.group({
      skillName: ['', [Validators.required, Validators.minLength(2)]],
      experienceLevel: ['Beginner', [Validators.required]],
      yearsOfExperience: [1, [Validators.required, Validators.min(1), Validators.max(30)]],
    });
  }

  private syncContractValidation(): void {
    const professionalInfo = this.form.get('professionalInfo') as FormGroup;
    const contractEndDate = professionalInfo.get('contractEndDate');
    const employmentType = professionalInfo.get('employmentType')?.value ?? 'Full Time';

    if (employmentType === 'Contract') {
      contractEndDate?.setValidators([Validators.required]);
    } else {
      contractEndDate?.clearValidators();
    }

    contractEndDate?.updateValueAndValidity();
  }

  private syncStateOptions(): void {
    const country = this.form.get('personalInfo.country')?.value ?? 'India';
    const nextStateOptions = this.employeeFormService.getStatesForCountry(country);
    this.stateOptions.set(nextStateOptions);

    const stateControl = this.form.get('personalInfo.state');
    if (stateControl && nextStateOptions.length > 0 && !nextStateOptions.includes(stateControl.value ?? '')) {
      stateControl.setValue('');
    }
  }

  private validateDuplicateSkills(): void {
    const skillGroups = this.skills.controls as FormGroup[];
    const seen = new Map<string, number>();

    skillGroups.forEach((group, index) => {
      const control = group.get('skillName');
      const value = String(control?.value ?? '').trim().toLowerCase();

      if (!value) {
        return;
      }

      const duplicateIndex = seen.get(value);

      if (duplicateIndex !== undefined && duplicateIndex !== index) {
        control?.setErrors({ ...(control.errors ?? {}), duplicateSkill: true });
        skillGroups[duplicateIndex].get('skillName')?.setErrors({ duplicateSkill: true });
      } else {
        const currentErrors = control?.errors ?? {};
        delete currentErrors['duplicateSkill'];
        control?.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
        seen.set(value, index);
      }
    });
  }
}
