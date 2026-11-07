// ============================================================================
// FILE: task-card.component.ts
// PURPOSE: Modern SaaS Task Card component demonstrating signal-based
//          input() and output() APIs with Lucide icons and sleek badges.
// ============================================================================

import { Component, input, output, computed } from '@angular/core';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { Task, TaskStatus, TaskPriority } from '../../../../shared/models/task.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, NgClass, DatePipe, IconComponent],
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent {
  // ──────────────────────────────────────────────────────────────────────────
  // SIGNAL-BASED INPUTS
  // ──────────────────────────────────────────────────────────────────────────
  readonly task = input.required<Task>();
  readonly enableEdit = input<boolean>(true);
  readonly highlightOverdue = input<boolean>(false);

  // ──────────────────────────────────────────────────────────────────────────
  // SIGNAL-BASED OUTPUTS
  // ──────────────────────────────────────────────────────────────────────────
  readonly editTask = output<Task>();
  readonly deleteTask = output<number>();
  readonly statusChange = output<{ taskId: number; newStatus: TaskStatus }>();
  readonly viewDetails = output<Task>();

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED SIGNALS
  // ──────────────────────────────────────────────────────────────────────────
  readonly isOverdue = computed<boolean>(() => {
    const t = this.task();
    if (!t.dueDate || t.status === TaskStatus.COMPLETED) return false;
    return new Date(t.dueDate) < new Date();
  });

  readonly statusClasses = computed<string>(() => {
    switch (this.task().status) {
      case TaskStatus.PENDING:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60';
      case TaskStatus.IN_PROGRESS:
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60';
      case TaskStatus.COMPLETED:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60';
    }
  });

  readonly priorityClasses = computed<string>(() => {
    switch (this.task().priority) {
      case TaskPriority.LOW:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      case TaskPriority.MEDIUM:
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60';
      case TaskPriority.HIGH:
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60';
    }
  });

  readonly categoryClasses = computed<string>(() => {
    switch (this.task().category) {
      case 'Engineering':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60';
      case 'Design':
        return 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60';
      case 'Product':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60';
      case 'DevOps':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  });

  readonly initials = computed<string>(() => {
    const t = this.task();
    if (t.assigneeAvatar) return t.assigneeAvatar;
    if (!t.assignee) return '??';
    const parts = t.assignee.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : t.assignee.slice(0, 2).toUpperCase();
  });

  readonly TaskStatus = TaskStatus;

  // ──────────────────────────────────────────────────────────────────────────
  // EVENT HANDLER METHODS
  // ──────────────────────────────────────────────────────────────────────────
  onEdit(): void {
    this.editTask.emit(this.task());
  }

  onDelete(): void {
    this.deleteTask.emit(this.task().id);
  }

  onStatusChange(newStatus: TaskStatus): void {
    this.statusChange.emit({
      taskId: this.task().id,
      newStatus,
    });
  }

  onView(): void {
    this.viewDetails.emit(this.task());
  }
}
