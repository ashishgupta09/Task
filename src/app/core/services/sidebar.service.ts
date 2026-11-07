import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  /** Mobile drawer open state */
  readonly isMobileOpen = signal<boolean>(false);

  /** Desktop sidebar collapsed state */
  readonly isCollapsed = signal<boolean>(false);

  toggleMobile(): void {
    this.isMobileOpen.update((open) => !open);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  toggleCollapse(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }
}
