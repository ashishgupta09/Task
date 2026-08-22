import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { Modal } from "../../shared/modal/modal";
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, Modal, FormsModule],
  selector: 'app-modal-trigger',
  styleUrl: './modal-trigger.css',
  templateUrl: './modal-trigger.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalTrigger {

  formName: string = '';
  formEmail: string = '';

  showInfo = signal(false);
  showConfirm = signal(false);
  showForm = signal(false);

  confirmResult = signal<string | null>(null);
  formSubmitted = signal<boolean>(false);
  formResult = signal('');

  onConfirm() {
    this.confirmResult.set('confirmed')
    this.showConfirm.set(false);
  }

  onCancel() {
    this.confirmResult.set('cancel');
    this.showConfirm.set(false);
  }

  onFormSubmit() {
    if (!this.formName.trim() || !this.formEmail.trim()) {
      this.formResult.set(`${this.formName} - ${this.formEmail}`);
      this.formSubmitted.set(true);
      this.showForm.set(false);
      this.formName = '';
      this.formEmail = '';
    }
  }
}
