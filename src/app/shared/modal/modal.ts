import { Component, ContentChild, HostListener, input, output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from "../../../../node_modules/@angular/common/types/_common_module-chunk";

@Component({
  imports: [NgTemplateOutlet],
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal {

  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg'>('md')

  readonly closed = output<void>();

  @ContentChild('modalBody') bodyTpl!: TemplateRef<unknown>;
  @ContentChild('modalFooter') footerTpl!: TemplateRef<unknown>;

  close() {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

}
