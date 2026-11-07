// ============================================================================
// FILE: task-communication.service.ts
// PURPOSE: Cross-component communication using RxJS BehaviorSubject.
//          This service demonstrates how UNRELATED components can share data
//          without parent-child relationships.
//
// ============================================================================
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                   WHAT IS A BehaviorSubject?                            ║
// ╠═══════════════════════════════════════════════════════════════════════════╣
// ║                                                                         ║
// ║  BehaviorSubject is a special type of RxJS Observable that:             ║
// ║                                                                         ║
// ║  1. REQUIRES an initial value (unlike Subject which has none).          ║
// ║  2. STORES the latest emitted value in memory.                         ║
// ║  3. REPLAYS the latest value to every NEW subscriber immediately.      ║
// ║  4. Is both an Observable (can be subscribed to) AND an Observer        ║
// ║     (can emit new values via .next()).                                  ║
// ║                                                                         ║
// ║  HOW IT DIFFERS FROM Subject:                                           ║
// ║  ─────────────────────────────────────────────────────────────────────  ║
// ║  Subject:         No initial value. New subscribers get NOTHING until   ║
// ║                   a new value is emitted.                               ║
// ║  BehaviorSubject: Has initial value. New subscribers IMMEDIATELY get    ║
// ║                   the latest value — even if .next() was called before  ║
// ║                   they subscribed.                                      ║
// ║                                                                         ║
// ║  WHY THIS MATTERS:                                                     ║
// ║  If HeaderComponent subscribes AFTER TaskListComponent has already      ║
// ║  updated the task count, Header still gets the current count            ║
// ║  immediately. With a plain Subject, Header would see nothing.           ║
// ║                                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
//
// ============================================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TaskNotification } from '../../shared/models/task.model';

/**
 * TaskCommunicationService — BehaviorSubject-based communication hub
 *
 * This service acts as a message bus between unrelated components:
 *   - HeaderComponent reads the task count and last action.
 *   - NotificationComponent reads notifications.
 *   - TaskListComponent and TaskFormComponent push updates.
 *
 * ARCHITECTURE PATTERN:
 *   Components never talk to each other directly. Instead:
 *   1. Producer component calls a service method (e.g., addNotification).
 *   2. Service updates the BehaviorSubject via .next().
 *   3. Consumer components receive the new value via their subscriptions.
 *
 *   Producer → Service (BehaviorSubject) → Consumer(s)
 *
 * WHY NOT JUST USE SIGNALS?
 *   You CAN use Signals for this. In fact, Signals are simpler for most cases.
 *   BehaviorSubject is demonstrated here because:
 *     1. Many enterprise codebases still use RxJS patterns.
 *     2. BehaviorSubject integrates with RxJS operators (debounce, switchMap, etc.).
 *     3. Interview questions frequently ask about BehaviorSubject.
 *     4. Some use cases need stream transformations that Signals don't provide.
 */
@Injectable({ providedIn: 'root' })
export class TaskCommunicationService {
  // ──────────────────────────────────────────────────────────────────────────
  // PRIVATE BehaviorSubjects — writable, internal only
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Private BehaviorSubject holding the current task count.
   *
   * `new BehaviorSubject<number>(0)` means:
   *   - Type: number
   *   - Initial value: 0
   *   - Any subscriber that connects right now gets 0 immediately.
   *
   * The underscore prefix + $ suffix is a naming convention:
   *   _name$ → private, writable BehaviorSubject
   *   name$  → public, read-only Observable
   */
  private readonly _taskCount$ = new BehaviorSubject<number>(0);

  /**
   * Private BehaviorSubject holding the notification list.
   * Initial value is an empty array — no notifications at startup.
   */
  private readonly _notifications$ = new BehaviorSubject<TaskNotification[]>(
    []
  );

  /**
   * Private BehaviorSubject holding the last action description.
   * Used to show "Last action: Task 'X' was created" in the header.
   */
  private readonly _lastAction$ = new BehaviorSubject<string>('');

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC OBSERVABLES — read-only, exposed to components
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * `.asObservable()` converts the BehaviorSubject to a plain Observable.
   *
   * WHY EXPOSE asObservable() INSTEAD OF THE BehaviorSubject DIRECTLY?
   *
   *   If we exposed `_taskCount$` directly, any component could call:
   *     this.commService._taskCount$.next(999);  // ← Bypasses service logic!
   *
   *   By exposing an Observable, components can ONLY subscribe (read).
   *   To update, they MUST call service methods like updateTaskCount().
   *
   *   This is the same principle as signal.asReadonly() — encapsulation.
   *
   *   ❌ BAD:  public taskCount$ = this._taskCount$;  // Writable from outside
   *   ✅ GOOD: public taskCount$ = this._taskCount$.asObservable(); // Read-only
   */
  readonly taskCount$: Observable<number> =
    this._taskCount$.asObservable();

  readonly notifications$: Observable<TaskNotification[]> =
    this._notifications$.asObservable();

  readonly lastAction$: Observable<string> =
    this._lastAction$.asObservable();

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS — controlled write access
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Updates the task count.
   *
   * `.next(value)` pushes a new value into the BehaviorSubject.
   *
   * WHAT HAPPENS WHEN .next() IS CALLED?
   *   1. The internal stored value is replaced with the new value.
   *   2. ALL current subscribers receive the new value synchronously.
   *   3. Any FUTURE subscribers will get this new value when they subscribe.
   *
   * Example timeline:
   *   _taskCount$ = new BehaviorSubject(0)   → stored value: 0
   *   HeaderComponent subscribes             → receives 0 immediately
   *   updateTaskCount(5)                     → .next(5) → Header receives 5
   *   SidebarComponent subscribes later      → receives 5 immediately
   *   updateTaskCount(8)                     → .next(8) → Header gets 8, Sidebar gets 8
   */
  updateTaskCount(count: number): void {
    this._taskCount$.next(count);
  }

  /**
   * Adds a notification to the list.
   *
   * IMMUTABLE UPDATE:
   *   We read the current value with `.getValue()`, create a new array
   *   with the new notification prepended, and emit the new array.
   *
   * `.getValue()` synchronously returns the current stored value.
   *   - Only available on BehaviorSubject (not on Subject or Observable).
   *   - Use sparingly — in reactive code, prefer .pipe() transformations.
   *   - Here it's appropriate because we're inside the service, building
   *     the next state from the current state.
   */
  addNotification(message: string, type: TaskNotification['type']): void {
    const currentNotifications = this._notifications$.getValue();
    const newNotification: TaskNotification = {
      id: Date.now(), // Simple unique ID based on timestamp
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    // Prepend (newest first) with a new array — immutable update.
    this._notifications$.next([newNotification, ...currentNotifications]);
  }

  /**
   * Marks a notification as read.
   * Creates a new array with the matching notification's `read` set to true.
   */
  markNotificationAsRead(id: number): void {
    const updated = this._notifications$.getValue().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this._notifications$.next(updated);
  }

  /** Clears all notifications by emitting an empty array. */
  clearNotifications(): void {
    this._notifications$.next([]);
  }

  /**
   * Updates the last action string.
   * Used by components to inform the header what just happened.
   */
  setLastAction(action: string): void {
    this._lastAction$.next(action);
  }

  /**
   * Returns an Observable of the unread notification count.
   *
   * Uses `.pipe(map(...))` to transform the notification array into a number.
   *
   * WHY .pipe(map()) INSTEAD OF A SEPARATE BehaviorSubject?
   *   - The unread count is DERIVED from notifications — not independent state.
   *   - Storing it separately would mean two BehaviorSubjects to keep in sync.
   *   - With .pipe(map()), it updates automatically when notifications change.
   *   - This is the RxJS equivalent of Angular's `computed()` for signals.
   */
  getUnreadCount(): Observable<number> {
    return this._notifications$.pipe(
      map((notifications) => notifications.filter((n) => !n.read).length)
    );
  }

  /**
   * Returns the current value of taskCount synchronously.
   * Useful for one-time reads without subscribing.
   */
  getCurrentTaskCount(): number {
    return this._taskCount$.getValue();
  }
}
