// ============================================================================
// FILE: task-search.component.ts
// PURPOSE: Search input that filters tasks by title/description via Signals.
// ============================================================================

import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../core/services/task.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-task-search',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './task-search.component.html',
})
export class TaskSearchComponent {
  private readonly taskService = inject(TaskService);

  readonly searchInput = signal<string>('');
  readonly hasSearchTerm = computed<boolean>(() => this.searchInput().length > 0);

  constructor() {
    // Keep local signal in sync if service filter is changed from outside (e.g. sidebar or reset)
    effect(() => {
      const currentServiceTerm = this.taskService.selectedFilter().searchTerm;
      if (this.searchInput() !== currentServiceTerm) {
        this.searchInput.set(currentServiceTerm);
      }
    });
  }

  onSearch(term: string): void {
    this.searchInput.set(term);
    this.taskService.updateFilter({ searchTerm: term });
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.taskService.updateFilter({ searchTerm: '' });
  }
}
