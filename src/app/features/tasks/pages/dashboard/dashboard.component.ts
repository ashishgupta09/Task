// ============================================================================
// FILE: dashboard.component.ts
// PURPOSE: Primary orchestrator page for the Real-Time Task Management Dashboard.
//          Brings together all 4 communication patterns:
//            1. Signals state management (TaskService)
//            2. Input/Output (TaskList + TaskCard)
//            3. BehaviorSubject (Syncing counts to communication service)
//            4. Routing (Query params and navigation links)
// ============================================================================

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { TaskService } from '../../../../core/services/task.service';
import { TaskCommunicationService } from '../../../../core/services/task-communication.service';
import { TaskStatisticsComponent } from '../../components/task-statistics/task-statistics.component';
import { TaskSearchComponent } from '../../components/task-search/task-search.component';
import { TaskFilterComponent } from '../../components/task-filter/task-filter.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TaskStatisticsComponent,
    TaskSearchComponent,
    TaskFilterComponent,
    TaskListComponent,
    IconComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly commService = inject(TaskCommunicationService);
  private readonly router = inject(Router);

  readonly today = new Date();

  ngOnInit(): void {
    // Synchronize initial task count to BehaviorSubject for header/notifications
    const initialCount = this.taskService.taskStatistics().total;
    this.commService.updateTaskCount(initialCount);
  }

  onCreateTask(): void {
    this.router.navigate(['/tasks', 'new']);
  }

  onResetFilters(): void {
    this.taskService.resetFilter();
  }
}
