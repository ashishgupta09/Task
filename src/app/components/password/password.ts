import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-password',
  styleUrl: './password.css',
  templateUrl: './password.html',
  standalone: true,
})
export class Password {
  password = signal('');

  get strength(): string {
    let value = this.password();

    if (!value) {
      return ''
    }

    if (value.length < 6) {
      return 'Weak'
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value)
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    if (
      value.length >= 10 &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecial
    ) {
      return 'Strong'
    }
    return 'Good'
  }

  getStrengthWidth(): number {
    switch (this.strength) {
      case 'Weak':
        return 33;
      case 'Good':
        return 66;
      case 'Strong':
        return 100;
      default:
        return 0;
    }
  }

  getStrengthColor(): string {
    switch (this.strength) {
      case 'Weak':
        return 'red';
      case 'Good':
        return 'orange';
      case 'Strong':
        return 'green';
      default:
        return 'transparent';
    }
  }
}
