// ============================================================================
// FILE: confirmation-dialog.component.ts
// PURPOSE: Reusable modal dialog for destructive actions with animations
// ============================================================================

import { Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop with blur -->
        <div
          (click)="onCancel()"
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        ></div>

        <!-- Dialog Card -->
        <div
          class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl transition-all border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
            >
              <app-icon name="alert-triangle" [size]="24" />
            </div>

            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-6">
                {{ title() }}
              </h3>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ message() }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {{ cancelText() }}
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 active:scale-95 transition"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmationDialogComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Delete Task');
  readonly message = input<string>(
    'Are you sure you want to delete this task? This action cannot be undone.'
  );
  readonly confirmText = input<string>('Delete');
  readonly cancelText = input<string>('Cancel');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
