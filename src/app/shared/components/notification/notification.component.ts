// ============================================================================
// FILE: notification.component.ts
// PURPOSE: Displays real-time task notifications using RxJS BehaviorSubject
//          and the Angular AsyncPipe with modern Lucide icons.
// ============================================================================

import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, DatePipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { TaskCommunicationService } from '../../../core/services/task-communication.service';
import { TaskNotification } from '../../models/task.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe, IconComponent],
  templateUrl: './notification.component.html',
})
export class NotificationComponent {
  private readonly commService = inject(TaskCommunicationService);

  readonly notifications$: Observable<TaskNotification[]> = this.commService.notifications$;
  readonly unreadCount$: Observable<number> = this.commService.getUnreadCount();

  readonly isOpen = signal<boolean>(false);

  togglePanel(): void {
    this.isOpen.update((open) => !open);
  }

  closePanel(): void {
    this.isOpen.set(false);
  }

  markAsRead(id: number): void {
    this.commService.markNotificationAsRead(id);
  }

  clearAll(): void {
    this.commService.clearNotifications();
  }
}
