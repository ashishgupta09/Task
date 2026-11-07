// ============================================================================
// FILE: task.service.spec.ts
// PURPOSE: Unit tests for TaskService verifying Angular Signals:
//          - Signal reactivity
//          - Computed signals (taskStatistics, filteredTasks)
//          - Immutable state updates (addTask, updateTask, deleteTask)
// ============================================================================

import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { TaskPriority, TaskStatus, CreateTaskPayload } from '../../shared/models/task.model';

describe('TaskService (Angular Signals)', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created and initialized with 8 sample tasks', () => {
    expect(service).toBeTruthy();
    expect(service.tasks().length).toBe(8);
  });

  it('should compute initial taskStatistics correctly', () => {
    const stats = service.taskStatistics();
    expect(stats.total).toBe(8);
    expect(stats.pending).toBe(4);
    expect(stats.inProgress).toBe(2);
    expect(stats.completed).toBe(2);
    expect(stats.completionRate).toBe(25); // 2/8 * 100 = 25%
  });

  it('should immutably add a new task and update signals synchronously', () => {
    const newPayload: CreateTaskPayload = {
      title: 'Write automated E2E tests',
      description: 'Implement Playwright smoke tests for the dashboard',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      assignee: 'Alex Murphy',
      dueDate: null,
    };

    const created = service.addTask(newPayload);

    expect(created.id).toBeDefined();
    expect(service.tasks().length).toBe(9);
    expect(service.tasks().some((t) => t.title === 'Write automated E2E tests')).toBe(true);

    // Computed statistics must automatically recalculate synchronously!
    const stats = service.taskStatistics();
    expect(stats.total).toBe(9);
    expect(stats.pending).toBe(5);
  });

  it('should delete a task and update computed signals', () => {
    const initialTotal = service.tasks().length;
    service.deleteTask(1); // Task 1 is COMPLETED

    expect(service.tasks().length).toBe(initialTotal - 1);
    expect(service.getTaskById(1)).toBeUndefined();

    // Verify statistics updated
    const stats = service.taskStatistics();
    expect(stats.total).toBe(7);
    expect(stats.completed).toBe(1);
  });

  it('should filter tasks by status reactively via computed signal', () => {
    service.updateFilter({ status: TaskStatus.IN_PROGRESS });

    const filtered = service.filteredTasks();
    expect(filtered.length).toBe(2);
    expect(filtered.every((t) => t.status === TaskStatus.IN_PROGRESS)).toBe(true);

    // Reset filter
    service.resetFilter();
    expect(service.filteredTasks().length).toBe(8);
  });

  it('should filter tasks by search term in title or description', () => {
    service.updateFilter({ searchTerm: 'authentication' });

    const filtered = service.filteredTasks();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Implement user authentication');
  });

  it('should update task status and recompute stats', () => {
    // Task 2 was IN_PROGRESS, move to COMPLETED
    service.updateTaskStatus(2, TaskStatus.COMPLETED);

    const task2 = service.getTaskById(2);
    expect(task2?.status).toBe(TaskStatus.COMPLETED);

    const stats = service.taskStatistics();
    expect(stats.completed).toBe(3);
    expect(stats.inProgress).toBe(1);
  });
});
