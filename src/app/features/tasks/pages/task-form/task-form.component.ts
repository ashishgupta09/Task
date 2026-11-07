// ============================================================================
// FILE: task-form.component.ts
// PURPOSE: Handles Add Task and Edit Task with Angular Reactive Forms,
//          Route parameters, and cross-component service synchronization.
// ============================================================================

import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  CreateTaskPayload,
} from '../../../../shared/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskCommunicationService } from '../../../../core/services/task-communication.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly commService = inject(TaskCommunicationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Whether we are editing an existing task or creating a new one */
  readonly isEditMode = signal<boolean>(false);
  readonly editingTaskId = signal<number | null>(null);

  /** Enums exposed for template dropdowns */
  readonly priorities = Object.values(TaskPriority);
  readonly statuses = Object.values(TaskStatus);
  readonly categories = Object.values(TaskCategory);

  /** Common assignees for quick selection */
  readonly suggestedAssignees = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Brown',
    'Diana Prince',
    'Alex Morgan',
  ];

  /**
   * Strongly typed reactive form using NonNullableFormBuilder
   */
  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    priority: [TaskPriority.MEDIUM, [Validators.required]],
    status: [TaskStatus.PENDING, [Validators.required]],
    category: [TaskCategory.ENGINEERING, [Validators.required]],
    assignee: ['', [Validators.required, Validators.minLength(2)]],
    dueDate: [''],
  });

  ngOnInit(): void {
    // Check if we have an :id route parameter
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          const id = Number(idParam);
          this.isEditMode.set(true);
          this.editingTaskId.set(id);
          this.populateForm(id);
        } else {
          this.isEditMode.set(false);
          this.editingTaskId.set(null);
        }
      });
  }

  setAssignee(name: string): void {
    this.form.controls.assignee.setValue(name);
  }

  private populateForm(id: number): void {
    const existingTask = this.taskService.getTaskById(id);
    if (existingTask) {
      this.form.patchValue({
        title: existingTask.title,
        description: existingTask.description,
        priority: existingTask.priority,
        status: existingTask.status,
        category: (existingTask.category as TaskCategory) || TaskCategory.ENGINEERING,
        assignee: existingTask.assignee,
        dueDate: existingTask.dueDate
          ? new Date(existingTask.dueDate).toISOString().substring(0, 10)
          : '',
      });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValues = this.form.getRawValue();
    const dueDate = formValues.dueDate ? new Date(formValues.dueDate) : null;

    if (this.isEditMode() && this.editingTaskId() !== null) {
      // Update Task
      const id = this.editingTaskId()!;
      this.taskService.updateTask(id, {
        title: formValues.title,
        description: formValues.description,
        priority: formValues.priority,
        status: formValues.status,
        category: formValues.category,
        assignee: formValues.assignee,
        dueDate,
      });

      this.commService.addNotification(`Updated task "${formValues.title}"`, 'SUCCESS');
      this.commService.setLastAction(`Updated task: ${formValues.title}`);

      this.router.navigate(['/tasks', id], {
        state: { source: 'form-update' },
      });
    } else {
      // Create Task
      const payload: CreateTaskPayload = {
        title: formValues.title,
        description: formValues.description,
        priority: formValues.priority,
        status: formValues.status,
        category: formValues.category,
        assignee: formValues.assignee,
        dueDate,
      };

      const created = this.taskService.addTask(payload);

      this.commService.updateTaskCount(this.taskService.taskStatistics().total);
      this.commService.addNotification(`Created new task "${created.title}"`, 'SUCCESS');
      this.commService.setLastAction(`Created task: ${created.title}`);

      this.router.navigate(['/dashboard']);
    }
  }

  onCancel(): void {
    if (this.isEditMode() && this.editingTaskId() !== null) {
      this.router.navigate(['/tasks', this.editingTaskId()]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
