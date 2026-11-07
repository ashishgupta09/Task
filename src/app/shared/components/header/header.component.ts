// ============================================================================
// FILE: header.component.ts
// PURPOSE: Top Header displaying real-time global state from BehaviorSubject,
//          Breadcrumb navigation, Search bar, Theme toggle, and Profile menu.
// ============================================================================

import { Component, inject, signal, DestroyRef } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TaskCommunicationService } from '../../../core/services/task-communication.service';
import { TaskService } from '../../../core/services/task.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { NotificationComponent } from '../notification/notification.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationComponent, IconComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly commService = inject(TaskCommunicationService);
  readonly themeService = inject(ThemeService);
  readonly sidebarService = inject(SidebarService);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Profile dropdown menu open state */
  readonly isProfileMenuOpen = signal<boolean>(false);

  /** Current route title for dynamic breadcrumb */
  readonly currentRouteLabel = signal<string>('Dashboard');

  /** Signals bridging RxJS Observables */
  readonly taskCount = signal<number>(0);
  readonly lastAction = signal<string>('System initialized');

  constructor() {
    // 1. Subscribe to taskCount$ with takeUntilDestroyed()
    this.commService.taskCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => {
        this.taskCount.set(count);
      });

    // 2. Subscribe to lastAction$ stream
    this.commService.lastAction$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => {
        if (action) {
          this.lastAction.set(action);
        }
      });

    // 3. Track router navigation for breadcrumbs
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        if (e.urlAfterRedirects.includes('/tasks/new')) {
          this.currentRouteLabel.set('New Task');
        } else if (e.urlAfterRedirects.includes('/edit')) {
          this.currentRouteLabel.set('Edit Task');
        } else if (e.urlAfterRedirects.includes('/tasks/')) {
          this.currentRouteLabel.set('Task Details');
        } else {
          this.currentRouteLabel.set('Dashboard');
        }
      });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((open) => !open);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  onGlobalSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.taskService.updateFilter({ searchTerm: input.value });
    if (!this.router.url.includes('/dashboard')) {
      this.router.navigate(['/dashboard']);
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/tasks', 'new']);
  }
}
