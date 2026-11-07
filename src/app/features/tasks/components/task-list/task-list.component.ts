// ============================================================================
// FILE: task-list.component.ts
// PURPOSE: Parent component that displays the task list with Grid and Table views,
//          modal delete confirmation, and Input/Output child communication.
// ============================================================================

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { Task, TaskStatus } from '../../../../shared/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskCommunicationService } from '../../../../core/services/task-communication.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

export type ViewMode = 'grid' | 'table';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TaskCardComponent,
    ConfirmationDialogComponent,
    IconComponent,
  ],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent {
  private readonly taskService = inject(TaskService);
  private readonly commService = inject(TaskCommunicationService);
  private readonly router = inject(Router);

  readonly filteredTasks = this.taskService.filteredTasks;
  readonly taskStatistics = this.taskService.taskStatistics;

  /** Toggle between Grid Card View and Table View */
  readonly viewMode = signal<ViewMode>('grid');

  /** Confirmation dialog state */
  readonly isConfirmOpen = signal<boolean>(false);
  readonly taskToDelete = signal<Task | null>(null);

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onEditTask(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit'], {
      state: { task, source: 'task-list-edit' },
    });
  }

  onPromptDelete(taskId: number): void {
    const task = this.taskService.getTaskById(taskId);
    if (task) {
      this.taskToDelete.set(task);
      this.isConfirmOpen.set(true);
    }
  }

  onConfirmDelete(): void {
    const task = this.taskToDelete();
    if (task) {
      this.onDeleteTask(task.id);
    }
    this.isConfirmOpen.set(false);
    this.taskToDelete.set(null);
  }

  onCancelDelete(): void {
    this.isConfirmOpen.set(false);
    this.taskToDelete.set(null);
  }

  onDeleteTask(taskId: number): void {
    const task = this.taskService.getTaskById(taskId);
    const taskTitle = task?.title ?? 'Unknown';

    this.taskService.deleteTask(taskId);

    this.commService.updateTaskCount(this.taskService.taskStatistics().total);
    this.commService.addNotification(
      `Task "${taskTitle}" was deleted`,
      'ERROR'
    );
    this.commService.setLastAction(`Deleted: ${taskTitle}`);
  }

  onStatusChange(event: { taskId: number; newStatus: TaskStatus }): void {
    const task = this.taskService.getTaskById(event.taskId);
    const taskTitle = task?.title ?? 'Unknown';

    this.taskService.updateTaskStatus(event.taskId, event.newStatus);

    this.commService.updateTaskCount(this.taskService.taskStatistics().total);
    this.commService.addNotification(
      `Task "${taskTitle}" moved to ${event.newStatus.replace('_', ' ')}`,
      'SUCCESS'
    );
    this.commService.setLastAction(
      `Status changed: ${taskTitle} → ${event.newStatus.replace('_', ' ')}`
    );
  }

  onAddTask(): void {
    this.router.navigate(['/tasks', 'new']);
  }

  navigateToDetail(task: Task): void {
    this.router.navigate(['/tasks', task.id], {
      queryParams: { source: 'list' },
      state: { task, source: 'task-list-view' },
    });
  }

  resetAllFilters(): void {
    this.taskService.resetFilter();
  }
}
