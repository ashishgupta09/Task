// ============================================================================
// FILE: task-filter.component.ts
// PURPOSE: Multi-criteria reactive filter toolbar with URL query param synchronization.
// ============================================================================

import { Component, inject, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TaskService } from '../../../../core/services/task.service';
import {
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '../../../../shared/models/task.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './task-filter.component.html',
})
export class TaskFilterComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectedFilter = this.taskService.selectedFilter;

  readonly statusOptions: Array<TaskStatus | 'ALL'> = [
    'ALL',
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
  ];

  readonly priorityOptions: Array<TaskPriority | 'ALL'> = [
    'ALL',
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
  ];

  readonly categoryOptions: Array<string | 'ALL'> = [
    'ALL',
    ...Object.values(TaskCategory),
  ];

  readonly sortOptions = [
    { label: 'Date Created (Newest)', value: 'createdAt', dir: 'desc' },
    { label: 'Date Created (Oldest)', value: 'createdAt', dir: 'asc' },
    { label: 'Due Date (Earliest)', value: 'dueDate', dir: 'asc' },
    { label: 'Priority (Highest)', value: 'priority', dir: 'desc' },
    { label: 'Title (A-Z)', value: 'title', dir: 'asc' },
  ];

  readonly hasActiveFilters = computed<boolean>(() => {
    const f = this.selectedFilter();
    return (
      f.status !== 'ALL' ||
      f.priority !== 'ALL' ||
      (f.category !== undefined && f.category !== 'ALL') ||
      f.searchTerm !== ''
    );
  });

  readonly activeFilterCount = computed<number>(() => {
    const f = this.selectedFilter();
    let count = 0;
    if (f.status !== 'ALL') count++;
    if (f.priority !== 'ALL') count++;
    if (f.category && f.category !== 'ALL') count++;
    if (f.searchTerm !== '') count++;
    return count;
  });

  ngOnInit(): void {
    // Synchronize filters with URL query parameters on load
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const statusParam = params.get('status') as TaskStatus | 'ALL' | null;
        const priorityParam = params.get('priority') as TaskPriority | 'ALL' | null;
        const categoryParam = params.get('category');
        const searchParam = params.get('q');
        const sortByParam = params.get('sort') as any;

        const updates: any = {};
        if (statusParam && (this.statusOptions as string[]).includes(statusParam)) {
          updates.status = statusParam;
        }
        if (priorityParam && (this.priorityOptions as string[]).includes(priorityParam)) {
          updates.priority = priorityParam;
        }
        if (categoryParam) {
          updates.category = categoryParam;
        }
        if (searchParam !== null) {
          updates.searchTerm = searchParam;
        }
        if (sortByParam) {
          updates.sortBy = sortByParam;
        }

        if (Object.keys(updates).length > 0) {
          this.taskService.updateFilter(updates);
        }
      });
  }

  onStatusFilter(status: TaskStatus | 'ALL'): void {
    this.taskService.updateFilter({ status });
    this.syncQueryParam('status', status === 'ALL' ? null : status);
  }

  onPriorityFilter(priority: TaskPriority | 'ALL'): void {
    this.taskService.updateFilter({ priority });
    this.syncQueryParam('priority', priority === 'ALL' ? null : priority);
  }

  onCategoryFilter(category: string): void {
    this.taskService.updateFilter({ category });
    this.syncQueryParam('category', category === 'ALL' ? null : category);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const [sortBy, dir] = select.value.split(':');
    this.taskService.updateFilter({
      sortBy: sortBy as any,
      sortDirection: dir as any,
    });
    this.syncQueryParam('sort', sortBy);
  }

  onReset(): void {
    this.taskService.resetFilter();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  private syncQueryParam(paramName: string, paramValue: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [paramName]: paramValue },
      queryParamsHandling: 'merge',
    });
  }

  formatLabel(value: string): string {
    return value.replace('_', ' ');
  }
}
