import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
  readonly isMenuOpen = signal(false);

  readonly options: Array<{ value: ThemeMode; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'system', label: 'System', icon: 'monitor' },
  ];

  get activeLabel(): string {
    return this.options.find((option) => option.value === this.themeService.currentTheme())?.label ?? 'System';
  }

  get activeIcon(): string {
    return this.options.find((option) => option.value === this.themeService.currentTheme())?.icon ?? 'monitor';
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
    this.isMenuOpen.set(false);
  }

  toggleMenu(): void {
    this.isMenuOpen.update((current) => !current);
  }
}
