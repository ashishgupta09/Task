// ============================================================================
// FILE: task.service.ts
// PURPOSE: Central state management service using Angular Signals.
//          This service demonstrates signal(), computed(), effect(),
//          asReadonly(), set(), and update() — the core Signal APIs.
// ============================================================================

import {
  Injectable,
  signal,
  computed,
  effect,
  DestroyRef,
  inject,
} from '@angular/core';

import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskFilter,
  TaskStatistics,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '../../shared/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly destroyRef = inject(DestroyRef);

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: WRITABLE SIGNAL — The single source of truth
  // ──────────────────────────────────────────────────────────────────────────
  private readonly _tasks = signal<Task[]>(this.getInitialTasks());

  /** Read-only view for external consumers */
  readonly tasks = this._tasks.asReadonly();

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: FILTER SIGNAL
  // ──────────────────────────────────────────────────────────────────────────
  readonly selectedFilter = signal<TaskFilter>({
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    searchTerm: '',
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: COMPUTED SIGNALS
  // ──────────────────────────────────────────────────────────────────────────
  readonly filteredTasks = computed<Task[]>(() => {
    const tasks = this._tasks();
    const filter = this.selectedFilter();

    const result = tasks.filter((task) => {
      // Status filter
      const matchesStatus =
        filter.status === 'ALL' || task.status === filter.status;

      // Priority filter
      const matchesPriority =
        filter.priority === 'ALL' || task.priority === filter.priority;

      // Category filter
      const matchesCategory =
        !filter.category ||
        filter.category === 'ALL' ||
        task.category === filter.category;

      // Search filter: case-insensitive substring match on title or description
      const matchesSearch =
        filter.searchTerm === '' ||
        task.title.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        task.description
          .toLowerCase()
          .includes(filter.searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(filter.searchTerm.toLowerCase());

      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });

    // Sort result
    if (filter.sortBy) {
      const dir = filter.sortDirection === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        if (filter.sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
        }
        if (filter.sortBy === 'priority') {
          const priorityWeight = {
            [TaskPriority.HIGH]: 3,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 1,
          };
          return (priorityWeight[a.priority] - priorityWeight[b.priority]) * dir;
        }
        if (filter.sortBy === 'title') {
          return a.title.localeCompare(b.title) * dir;
        }
        // default createdAt
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      });
    }

    return result;
  });

  /** Aggregated counts for the dashboard */
  readonly taskStatistics = computed<TaskStatistics>(() => {
    const tasks = this._tasks();
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS
    ).length;
    const completed = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED
    ).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  /** Convenience computeds */
  readonly pendingTasks = computed<Task[]>(() =>
    this._tasks().filter((t) => t.status === TaskStatus.PENDING)
  );

  readonly inProgressTasks = computed<Task[]>(() =>
    this._tasks().filter((t) => t.status === TaskStatus.IN_PROGRESS)
  );

  readonly completedTasks = computed<Task[]>(() =>
    this._tasks().filter((t) => t.status === TaskStatus.COMPLETED)
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: EFFECT
  // ──────────────────────────────────────────────────────────────────────────
  private readonly taskChangeEffect = effect(() => {
    const tasks = this._tasks();
    console.log(
      `[TaskService Effect] Task list count: ${tasks.length} | Pending: ${
        tasks.filter((t) => t.status === TaskStatus.PENDING).length
      } | InProgress: ${
        tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
      } | Completed: ${
        tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
      }`
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: SERVICE METHODS
  // ──────────────────────────────────────────────────────────────────────────
  getTaskById(id: number): Task | undefined {
    return this._tasks().find((task) => task.id === id);
  }

  addTask(payload: CreateTaskPayload): Task {
    const newTask: Task = {
      ...payload,
      id: this.generateId(),
      category: payload.category || TaskCategory.ENGINEERING,
      assigneeAvatar: this.generateAvatarInitials(payload.assignee),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this._tasks.update((currentTasks) => [...currentTasks, newTask]);
    return newTask;
  }

  updateTask(id: number, changes: UpdateTaskPayload): void {
    this._tasks.update((tasks) =>
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...changes,
              assigneeAvatar: changes.assignee
                ? this.generateAvatarInitials(changes.assignee)
                : task.assigneeAvatar,
              updatedAt: new Date(),
            }
          : task
      )
    );
  }

  deleteTask(id: number): void {
    this._tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }

  updateTaskStatus(id: number, status: TaskStatus): void {
    this.updateTask(id, { status });
  }

  updateFilter(changes: Partial<TaskFilter>): void {
    this.selectedFilter.update((current) => ({ ...current, ...changes }));
  }

  resetFilter(): void {
    this.selectedFilter.set({
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
      sortBy: 'createdAt',
      sortDirection: 'desc',
      searchTerm: '',
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: HELPERS
  // ──────────────────────────────────────────────────────────────────────────
  private generateId(): number {
    const tasks = this._tasks();
    return tasks.length > 0
      ? Math.max(...tasks.map((t) => t.id)) + 1
      : 1;
  }

  private generateAvatarInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  private getInitialTasks(): Task[] {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    return [
      {
        id: 1,
        title: 'Design login page UI',
        description:
          'Create wireframes and high-fidelity mockups for the login page, including form validation states and responsive layouts.',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        assignee: 'Alice Johnson',
        assigneeAvatar: 'AJ',
        category: TaskCategory.DESIGN,
        createdAt: new Date(now.getTime() - 10 * dayMs),
        updatedAt: new Date(now.getTime() - 2 * dayMs),
        dueDate: new Date(now.getTime() - 1 * dayMs),
      },
      {
        id: 2,
        title: 'Implement user authentication',
        description:
          'Build JWT-based authentication with login, logout, and token refresh. Integrate with the backend auth API.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assignee: 'Bob Smith',
        assigneeAvatar: 'BS',
        category: TaskCategory.ENGINEERING,
        createdAt: new Date(now.getTime() - 8 * dayMs),
        updatedAt: new Date(now.getTime() - 1 * dayMs),
        dueDate: new Date(now.getTime() + 3 * dayMs),
      },
      {
        id: 3,
        title: 'Set up CI/CD pipeline',
        description:
          'Configure GitHub Actions for automated testing, linting, and deployment to staging environment.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        assignee: 'Charlie Brown',
        assigneeAvatar: 'CB',
        category: TaskCategory.DEVOPS,
        createdAt: new Date(now.getTime() - 5 * dayMs),
        updatedAt: new Date(now.getTime() - 5 * dayMs),
        dueDate: new Date(now.getTime() + 7 * dayMs),
      },
      {
        id: 4,
        title: 'Write API documentation',
        description:
          'Document all REST endpoints using OpenAPI/Swagger. Include request/response examples.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        assignee: 'Diana Prince',
        assigneeAvatar: 'DP',
        category: TaskCategory.PRODUCT,
        createdAt: new Date(now.getTime() - 3 * dayMs),
        updatedAt: new Date(now.getTime() - 3 * dayMs),
        dueDate: new Date(now.getTime() + 14 * dayMs),
      },
      {
        id: 5,
        title: 'Fix navigation bar responsive bug',
        description:
          'The hamburger menu does not close after selecting a link on mobile devices. Debug and fix the issue.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        assignee: 'Alice Johnson',
        assigneeAvatar: 'AJ',
        category: TaskCategory.ENGINEERING,
        createdAt: new Date(now.getTime() - 2 * dayMs),
        updatedAt: new Date(now.getTime() - 1 * dayMs),
        dueDate: new Date(now.getTime() + 1 * dayMs),
      },
      {
        id: 6,
        title: 'Database schema migration',
        description:
          'Migrate the users table to include new profile fields: avatar, bio, and social links.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        assignee: 'Bob Smith',
        assigneeAvatar: 'BS',
        category: TaskCategory.DEVOPS,
        createdAt: new Date(now.getTime() - 1 * dayMs),
        updatedAt: new Date(now.getTime() - 1 * dayMs),
        dueDate: new Date(now.getTime() + 5 * dayMs),
      },
      {
        id: 7,
        title: 'Add unit tests for TaskService',
        description:
          'Write comprehensive unit tests covering addTask, deleteTask, updateTask, and filter logic.',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        assignee: 'Charlie Brown',
        assigneeAvatar: 'CB',
        category: TaskCategory.ENGINEERING,
        createdAt: new Date(now.getTime() - 12 * dayMs),
        updatedAt: new Date(now.getTime() - 4 * dayMs),
        dueDate: new Date(now.getTime() - 3 * dayMs),
      },
      {
        id: 8,
        title: 'Performance audit and optimization',
        description:
          'Run Lighthouse audit, optimize bundle size, implement lazy loading for feature modules.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        assignee: 'Diana Prince',
        assigneeAvatar: 'DP',
        category: TaskCategory.ENGINEERING,
        createdAt: new Date(now.getTime() - 1 * dayMs),
        updatedAt: new Date(now.getTime() - 1 * dayMs),
        dueDate: null,
      },
    ];
  }
}
