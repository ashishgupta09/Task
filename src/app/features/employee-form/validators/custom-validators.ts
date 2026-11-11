import { AbstractControl, ValidationErrors } from '@angular/forms';

export function phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();

  if (!value) {
    return null;
  }

  const pattern = /^\+?[0-9\s()-]{10,15}$/;
  const isValid = pattern.test(value) && value.replace(/\D/g, '').length >= 10;

  return isValid ? null : { invalidPhoneNumber: true };
}

export function employeeIdValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();

  if (!value) {
    return null;
  }

  return /^[A-Z]{2,4}-\d{3,6}$/i.test(value) ? null : { invalidEmployeeId: true };
}

export function profilePictureValidator(control: AbstractControl): ValidationErrors | null {
  const file = control.value as File | null;

  if (!file) {
    return null;
  }

  if (file.size > 2 * 1024 * 1024) {
    return { fileTooLarge: true };
  }

  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    return { invalidFileType: true };
  }

  return null;
}

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value ?? '';
  const confirmPassword = group.get('confirmPassword')?.value ?? '';

  if (!password && !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

export function workExperienceDateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const startDate = group.get('startDate')?.value;
  const endDate = group.get('endDate')?.value;
  const currentlyWorking = group.get('currentlyWorking')?.value;

  if (!startDate || !endDate || currentlyWorking) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return start <= end ? null : { invalidDateRange: true };
}

export function minOneRecordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!Array.isArray(value) || value.length > 0) {
    return null;
  }

  return { minOneRecord: true };
}
