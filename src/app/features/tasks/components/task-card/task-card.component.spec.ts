// ============================================================================
// FILE: task-card.component.spec.ts
// PURPOSE: Unit tests for TaskCardComponent verifying:
//          - Signal-based input bindings (input.required)
//          - Signal-based output emissions (output<T>)
// ============================================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { Task, TaskPriority, TaskStatus } from '../../../../shared/models/task.model';

describe('TaskCardComponent (Input & Output)', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  const mockTask: Task = {
    id: 101,
    title: 'Write Unit Tests',
    description: 'Ensure 100% test coverage for input/output components',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    assignee: 'Grace Hopper',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 86400000), // tomorrow
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;

    // Set signal inputs using fixture.componentRef.setInput
    fixture.componentRef.setInput('task', mockTask);
    fixture.componentRef.setInput('enableEdit', true);
    fixture.detectChanges();
  });

  it('should render task title and assignee via signal inputs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Write Unit Tests');
    expect(compiled.textContent).toContain('Grace Hopper');
  });

  it('should emit editTask event when onEdit is called', () => {
    let emittedTask: Task | undefined;
    component.editTask.subscribe((t) => {
      emittedTask = t;
    });

    component.onEdit();
    expect(emittedTask).toEqual(mockTask);
  });

  it('should emit deleteTask event with task id when onDelete is called', () => {
    let deletedId: number | undefined;
    component.deleteTask.subscribe((id) => {
      deletedId = id;
    });

    component.onDelete();
    expect(deletedId).toBe(101);
  });

  it('should emit statusChange event when onStatusChange is called', () => {
    let changeEvent: { taskId: number; newStatus: TaskStatus } | undefined;
    component.statusChange.subscribe((evt) => {
      changeEvent = evt;
    });

    component.onStatusChange(TaskStatus.COMPLETED);
    expect(changeEvent).toEqual({
      taskId: 101,
      newStatus: TaskStatus.COMPLETED,
    });
  });
});
