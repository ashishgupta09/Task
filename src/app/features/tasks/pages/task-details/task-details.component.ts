// ============================================================================
// FILE: task-details.component.ts
// PURPOSE: Demonstrates complete Angular Router Data Communication:
//          1. Route Parameters (snapshot vs observable-based paramMap)
//          2. Query Parameters (reading, updating, preserving)
//          3. Router Navigation State (passing & reading ephemeral state)
//          4. router.navigate() vs router.navigateByUrl()
// ============================================================================

import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Task, TaskStatus, TaskPriority } from '../../../../shared/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskCommunicationService } from '../../../../core/services/task-communication.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent, ConfirmationDialogComponent],
  templateUrl: './task-details.component.html',
})
export class TaskDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly commService = inject(TaskCommunicationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly task = signal<Task | null>(null);
  readonly taskId = signal<number | null>(null);
  readonly navigationSource = signal<string | null>(null);
  readonly activeTab = signal<string>('overview');
  readonly isConfirmOpen = signal<boolean>(false);

  readonly TaskStatus = TaskStatus;

  ngOnInit(): void {
    // 1. Observable route parameters (handles dynamic in-place navigation)
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          const id = Number(idParam);
          this.taskId.set(id);
          this.loadTask(id);
        }
      });

    // 2. Query Parameters
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((queryParams) => {
        const tab = queryParams.get('tab') || 'overview';
        this.activeTab.set(tab);

        const source = queryParams.get('source');
        if (source) {
          this.navigationSource.set(source);
        }
      });

    // 3. Navigation State (history.state)
    const navState = history.state as { task?: Task; source?: string };
    if (navState && navState.source) {
      this.navigationSource.set(navState.source);
    }
  }

  private loadTask(id: number): void {
    const foundTask = this.taskService.getTaskById(id);
    this.task.set(foundTask ?? null);
  }

  switchTab(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  navigateToNextTask(): void {
    const currentId = this.taskId();
    if (currentId !== null) {
      const allTasks = this.taskService.tasks();
      if (allTasks.length === 0) return;
      const currentIndex = allTasks.findIndex((t) => t.id === currentId);
      const nextIndex = (currentIndex + 1) % allTasks.length;
      const nextTask = allTasks[nextIndex];

      this.router.navigate(['/tasks', nextTask.id], {
        queryParamsHandling: 'preserve',
      });
    }
  }

  onEdit(): void {
    const t = this.task();
    if (t) {
      this.router.navigateByUrl(`/tasks/${t.id}/edit`);
    }
  }

  onPromptDelete(): void {
    this.isConfirmOpen.set(true);
  }

  onConfirmDelete(): void {
    this.isConfirmOpen.set(false);
    this.onDelete();
  }

  onCancelDelete(): void {
    this.isConfirmOpen.set(false);
  }

  onDelete(): void {
    const t = this.task();
    if (t) {
      this.taskService.deleteTask(t.id);
      this.commService.updateTaskCount(this.taskService.taskStatistics().total);
      this.commService.addNotification(`Task "${t.title}" deleted from detail page`, 'ERROR');
      this.router.navigate(['/dashboard']);
    }
  }

  onStatusChange(newStatus: TaskStatus | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): void {
    const t = this.task();
    if (t) {
      const statusEnum = newStatus as TaskStatus;
      this.taskService.updateTaskStatus(t.id, statusEnum);
      this.task.set({ ...t, status: statusEnum });
      this.commService.addNotification(`Task "${t.title}" updated to ${statusEnum}`, 'SUCCESS');
      this.commService.setLastAction(`Status: ${t.title} → ${statusEnum}`);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
