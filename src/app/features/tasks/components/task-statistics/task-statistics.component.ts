// ============================================================================
// FILE: task-statistics.component.ts
// PURPOSE: Dashboard statistics panel showing task counts using computed signals.
//          Demonstrates CONSUMING computed signals from a shared service.
// ============================================================================

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../../core/services/task.service';
import { StatisticsCardComponent } from '../statistics-card/statistics-card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-task-statistics',
  standalone: true,
  imports: [CommonModule, StatisticsCardComponent, IconComponent],
  templateUrl: './task-statistics.component.html',
})
export class TaskStatisticsComponent {
  private readonly taskService = inject(TaskService);

  readonly stats = this.taskService.taskStatistics;

  readonly completionText = computed<string>(
    () => `${this.stats().completionRate}%`
  );

  readonly pendingPercent = computed<string>(() => {
    const s = this.stats();
    return s.total > 0 ? `${Math.round((s.pending / s.total) * 100)}%` : '0%';
  });

  readonly inProgressPercent = computed<string>(() => {
    const s = this.stats();
    return s.total > 0 ? `${Math.round((s.inProgress / s.total) * 100)}%` : '0%';
  });
}
