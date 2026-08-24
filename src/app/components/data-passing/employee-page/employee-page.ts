import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Employee } from '../services/employee';
import { EmployeeDetails } from '../models/employee.model';
import { EmployeeForm } from '../employee-form/employee-form';

@Component({
  imports: [CommonModule,EmployeeForm],
  selector: 'app-employee-page',
  templateUrl: './employee-page.html',
  standalone: true
})
export class EmployeePage {
  private employeeService = inject(Employee);

  employee: EmployeeDetails = {
    employeeId: 1001,
    firstName: 'Ashish',
    lastName: 'Gupta',
    email: 'ashish@example.com',
    phone: '9876543210',
    department: 'Engineering',
    designation: 'Senior Angular Developer',
    location: 'Pune',
    joiningDate: '2024-01-15',
    employmentType: 'Full Time',
    manager: 'John Smith',
    salary: 1800000,
    status: 'Active',
    skills: [
      'Angular',
      'TypeScript',
      'RxJS'
    ],
    isRemote: true
  };


  // Lookup data that the child needs.
  departments = [
    'Engineering',
    'Finance',
    'HR',
    'Marketing',
    'Sales'
  ];

  locations = [
    'Pune',
    'Mumbai',
    'Bangalore',
    'Hyderabad',
    'Delhi'
  ];


  managers = [
    'John Smith',
    'David Miller',
    'Sarah Wilson'
  ];


  employmentTypes = [
    'Full Time',
    'Part Time',
    'Contract'
  ];


  statuses = [
    'Active',
    'Inactive',
    'On Leave'
  ];

  onEmployeeSaved(employee: EmployeeDetails): void {
    console.log(
      'Parent received updated employee:',
      employee
    );

    this.employeeService.updateEmployee(employee).subscribe({
      next: (response) => {
        console.log(
          'Employee updated successfully:',
          response
        );
        this.employee = response;
      }, error: (error) => {
        console.error(
          'Failed to update employee:',
          error
        );
      }
    })
  }

  onCancelled(): void {
    console.log(
      'Employee editing cancelled'
    );
  }

  onDeleteEmployee(employeeId: number): void {
    console.log(
      'Delete requested:',
      employeeId
    );

    this.employeeService
      .deleteEmployee(employeeId)
      .subscribe({
        next: (success) => {
          if (success) {
            console.log(
              'Employee deleted successfully'
            );
          }
        },

        error: (error) => {
          console.error(
            'Delete failed:',
            error
          );
        }
      });
  }

}
