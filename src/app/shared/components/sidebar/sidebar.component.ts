// ============================================================================
// FILE: sidebar.component.ts
// PURPOSE: Modern SaaS vertical navigation sidebar with responsive drawer
// ============================================================================

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { SidebarService } from '../../../core/services/sidebar.service';
import { TaskService } from '../../../core/services/task.service';
import { TaskStatus, TaskCategory } from '../../models/task.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly sidebarService = inject(SidebarService);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  // Statistics signals for sidebar counts
  readonly stats = this.taskService.taskStatistics;
  readonly selectedFilter = this.taskService.selectedFilter;

  readonly categories = Object.values(TaskCategory);
  readonly TaskStatus = TaskStatus;

  selectNav(statusFilter: TaskStatus | 'ALL' | string, userFilter: string = '', categoryFilter: string = 'ALL'): void {
    this.taskService.updateFilter({
      status: statusFilter as TaskStatus | 'ALL',
      category: categoryFilter,
      searchTerm: userFilter,
    });
    this.router.navigate(['/dashboard']);
    this.sidebarService.closeMobile();
  }

  isFilterActive(status: TaskStatus | 'ALL' | string, isUserOnly = false): boolean {
    const f = this.selectedFilter();
    if (isUserOnly) {
      return f.searchTerm === 'Alice Johnson';
    }
    return f.status === status && f.searchTerm === '' && (!f.category || f.category === 'ALL');
  }

  isCategoryActive(cat: string): boolean {
    return this.selectedFilter().category === cat;
  }

  selectCategory(category: string): void {
    this.taskService.updateFilter({
      category,
      searchTerm: '',
    });
    this.router.navigate(['/dashboard']);
    this.sidebarService.closeMobile();
  }

  openSettings(): void {
    alert('Settings Modal: You can customize your notification preferences, theme defaults, and workspace permissions.');
    this.sidebarService.closeMobile();
  }
}
