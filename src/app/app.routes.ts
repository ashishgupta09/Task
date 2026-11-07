// ============================================================================
// FILE: app.routes.ts
// PURPOSE: Application routing table demonstrating route parameters,
//          lazy loading standalone components, and redirects.
// ============================================================================

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import(
        './features/tasks/pages/dashboard/dashboard.component'
      ).then((m) => m.DashboardComponent),
    title: 'Dashboard | TaskManager 22',
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import(
        './features/tasks/pages/task-form/task-form.component'
      ).then((m) => m.TaskFormComponent),
    title: 'New Task | TaskManager 22',
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import(
        './features/tasks/pages/task-details/task-details.component'
      ).then((m) => m.TaskDetailsComponent),
    title: 'Task Details | TaskManager 22',
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () =>
      import(
        './features/tasks/pages/task-form/task-form.component'
      ).then((m) => m.TaskFormComponent),
    title: 'Edit Task | TaskManager 22',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
