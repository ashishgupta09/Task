import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeDetails } from '../models/employee.model';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-employee-form',
  styleUrl: './employee-form.css',
  templateUrl: './employee-form.html',
  standalone: true
})
export class EmployeeForm {
  private fb = inject(FormBuilder)
  employee = input.required<EmployeeDetails>();
  departments = input.required<string[]>();
  locations = input.required<string[]>();
  managers = input.required<string[]>();
  employmentTypes = input.required<string[]>();
  statuses = input.required<string[]>();

  employeeSaved = output<EmployeeDetails>();
  cancelled = output<void>();
  deleteRequested = output<number>();

  skillsInput = '';

  employeeForm = this.fb.group({
    employeeId: [0],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    department: ['', Validators.required],
    designation: ['', Validators.required],
    joiningDate: [''],
    employmentType: [''],
    location: ['', Validators.required],
    manager: ['', Validators.required],
    salary: [0, [Validators.required, Validators.min(0)]],
    status: ['Active', Validators.required],
    skills: [[] as string[]],
    isRemote: [false]
  })

  constructor() {
    effect(() => {
      const employee = this.employee();
      this.skillsInput = employee.skills?.join(', ') ?? '';

      this.employeeForm.patchValue({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        location: employee.location,
        joiningDate: employee.joiningDate,
        employmentType: employee.employmentType,
        manager: employee.manager,
        salary: employee.salary,
        status: employee.status,
        skills: employee.skills ?? [],
        isRemote: employee.isRemote
      })
    })
  }

  saveEmployee(): void {

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched;
      return;
    }

    const employee: EmployeeDetails =
      this.employeeForm.getRawValue();
    console.log('child emitting employee:', employee);

    this.employeeSaved.emit(employee);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  deleteEmployee(): void {
    const employeeId = Number(this.employeeForm.controls.employeeId.value);
    this.deleteRequested.emit(employeeId);
  }

  isInvalid(
    controlName: keyof typeof this.employeeForm.controls
  ): boolean {
    const control = this.employeeForm.controls[controlName];
    return control.invalid && (control.dirty && control.touched);
  }

  onSkillsChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.skillsInput = input.value;
    const skills = input.value.split(',').
      map(skills => skills.trim()).filter(Boolean);
    this.employeeForm.controls.skills.setValue(skills);
  }

}
