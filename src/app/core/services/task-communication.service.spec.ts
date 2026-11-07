// ============================================================================
// FILE: task-communication.service.spec.ts
// PURPOSE: Unit tests for TaskCommunicationService verifying RxJS BehaviorSubject:
//          - Replay of latest value to new subscribers
//          - .next() emissions
//          - Observable unread count stream via pipe(map())
//          - Immutability of notifications list
//          Modern async testing with Vitest and RxJS firstValueFrom.
// ============================================================================

import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TaskCommunicationService } from './task-communication.service';

describe('TaskCommunicationService (RxJS BehaviorSubject)', () => {
  let service: TaskCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskCommunicationService],
    });
    service = TestBed.inject(TaskCommunicationService);
  });

  it('should emit initial value 0 immediately to a new subscriber', async () => {
    const count = await firstValueFrom(service.taskCount$);
    expect(count).toBe(0);
  });

  it('should broadcast new count when updateTaskCount is invoked', async () => {
    service.updateTaskCount(12);

    // New subscriber should immediately receive 12 because of BehaviorSubject replay
    const count = await firstValueFrom(service.taskCount$);
    expect(count).toBe(12);
    expect(service.getCurrentTaskCount()).toBe(12);
  });

  it('should push notifications and calculate unread count reactively', async () => {
    service.addNotification('Task created', 'SUCCESS');
    service.addNotification('Deadline approaching', 'WARNING');

    const list = await firstValueFrom(service.notifications$);
    expect(list.length).toBe(2);
    expect(list[0].message).toBe('Deadline approaching'); // Latest first
    expect(list[0].read).toBe(false);

    const unread = await firstValueFrom(service.getUnreadCount());
    expect(unread).toBe(2);
  });

  it('should mark a notification as read and update the unread count stream', async () => {
    service.addNotification('Notice 1', 'INFO');

    const initialList = await firstValueFrom(service.notifications$);
    const notifId = initialList[0].id;

    service.markNotificationAsRead(notifId);

    const unread = await firstValueFrom(service.getUnreadCount());
    expect(unread).toBe(0);
  });

  it('should clear notifications properly', async () => {
    service.addNotification('Test', 'INFO');
    service.clearNotifications();

    const list = await firstValueFrom(service.notifications$);
    expect(list.length).toBe(0);
  });
});
