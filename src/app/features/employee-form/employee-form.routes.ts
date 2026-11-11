import { Routes } from '@angular/router';

export const employeeFormRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/employee-form/employee-form.component').then(
        (m) => m.EmployeeFormComponent,
      ),
    title: 'Employee Registration | TaskManager 22',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/employee-form/employee-form.component').then(
        (m) => m.EmployeeFormComponent,
      ),
    title: 'New Employee | TaskManager 22',
  },
];
