import { computed, effect, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private static readonly STORAGE_KEY = 'taskflow_theme';

  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());
  readonly resolvedTheme = computed<Theme>(() => {
    const mode = this.currentTheme();

    if (typeof window === 'undefined') {
      return 'light';
    }

    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return mode;
  });

  constructor() {
    effect(() => {
      const theme = this.resolvedTheme();
      const mode = this.currentTheme();

      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.classList.toggle('dark', theme === 'dark');
      }

      try {
        localStorage.setItem(ThemeService.STORAGE_KEY, mode);
      } catch {
        // ignore environments without localStorage support
      }
    });

    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (this.currentTheme() === 'system') {
          this.resolvedTheme();
        }
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(listener);
      }
    }
  }

  toggleTheme(): void {
    const current = this.currentTheme();

    if (current === 'dark') {
      this.setTheme('light');
      return;
    }

    if (current === 'light') {
      this.setTheme('system');
      return;
    }

    this.setTheme('dark');
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'system';
    }

    const saved = localStorage.getItem(ThemeService.STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
