// ============================================================================
// FILE: statistics-card.component.ts
// PURPOSE: Reusable SaaS metric card with dynamic signal values, trend badges,
//          Lucide icons, and hover lift effects.
// ============================================================================

import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

export type CardColorScheme = 'indigo' | 'amber' | 'sky' | 'emerald';

@Component({
  selector: 'app-statistics-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      [ngClass]="cardBorderClasses()"
    >
      <!-- Subtle top gradient accent line -->
      <div class="absolute inset-x-0 top-0 h-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100" [ngClass]="accentBarClasses()"></div>

      <div class="flex items-start justify-between gap-3">
        <!-- Title & Subtitle -->
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ title() }}
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {{ value() }}
            </span>
          </div>
        </div>

        <!-- Lucide Icon in colored badge -->
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-xs"
          [ngClass]="iconBadgeClasses()"
        >
          <app-icon [name]="icon()" [size]="20" />
        </div>
      </div>

      <!-- Trend / Subtitle Row -->
      <div class="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div class="flex items-center gap-1.5 font-semibold" [ngClass]="trendClasses()">
          @if (trendDirection() === 'up') {
            <app-icon name="trending-up" [size]="14" />
          } @else if (trendDirection() === 'down') {
            <app-icon name="trending-down" [size]="14" />
          } @else {
            <app-icon name="clock" [size]="14" />
          }
          <span>{{ trend() }}</span>
        </div>

        <span class="text-slate-400 dark:text-slate-500 font-medium">
          {{ subtitle() }}
        </span>
      </div>
    </div>
  `,
})
export class StatisticsCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number | string>();
  readonly icon = input.required<string>();
  readonly color = input<CardColorScheme>('indigo');
  readonly trend = input<string>('+0%');
  readonly trendDirection = input<'up' | 'down' | 'neutral'>('neutral');
  readonly subtitle = input<string>('Overview');

  readonly cardBorderClasses = computed(() => {
    switch (this.color()) {
      case 'indigo':
        return 'border-indigo-100 dark:border-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-800';
      case 'amber':
        return 'border-amber-100 dark:border-amber-950/50 hover:border-amber-300 dark:hover:border-amber-800';
      case 'sky':
        return 'border-sky-100 dark:border-sky-950/50 hover:border-sky-300 dark:hover:border-sky-800';
      case 'emerald':
        return 'border-emerald-100 dark:border-emerald-950/50 hover:border-emerald-300 dark:hover:border-emerald-800';
    }
  });

  readonly accentBarClasses = computed(() => {
    switch (this.color()) {
      case 'indigo':
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600';
      case 'amber':
        return 'bg-gradient-to-r from-amber-400 to-amber-500';
      case 'sky':
        return 'bg-gradient-to-r from-sky-400 to-sky-500';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    }
  });

  readonly iconBadgeClasses = computed(() => {
    switch (this.color()) {
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400';
      case 'sky':
        return 'bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400';
    }
  });

  readonly trendClasses = computed(() => {
    switch (this.color()) {
      case 'indigo':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'amber':
        return 'text-amber-600 dark:text-amber-400';
      case 'sky':
        return 'text-sky-600 dark:text-sky-400';
      case 'emerald':
        return 'text-emerald-600 dark:text-emerald-400';
    }
  });
}
