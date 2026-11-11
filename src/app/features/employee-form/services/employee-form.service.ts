import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, delay, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeFormService {
  readonly genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;
  readonly departments = [
    'Engineering',
    'Human Resources',
    'Finance',
    'Operations',
    'Sales',
    'Marketing',
    'Product',
    'Customer Support',
  ] as const;
  readonly workLocations = ['Hybrid', 'Remote', 'Onsite'] as const;
  readonly accountStatuses = ['Active', 'Pending', 'Disabled', 'Suspended'] as const;
  readonly employmentTypes = ['Full Time', 'Part Time', 'Contract', 'Internship'] as const;
  readonly skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
  readonly countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'] as const;

  private readonly employeeIdRegistry = new Set(['EMP-1001', 'EMP-1002', 'EMP-1003']);

  readonly statesByCountry: Record<string, string[]> = {
    India: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat'],
    'United States': ['California', 'New York', 'Texas', 'Washington', 'Florida'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'],
    Canada: ['Ontario', 'Quebec', 'Alberta', 'British Columbia'],
    Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
    Germany: ['Berlin', 'Bavaria', 'Hamburg', 'North Rhine-Westphalia'],
  };

  getStatesForCountry(country: string): string[] {
    return this.statesByCountry[country] ?? [];
  }

  checkEmployeeIdAvailability(employeeId: string): Observable<boolean> {
    const normalized = employeeId.trim().toUpperCase();

    if (!normalized) {
      return of(false).pipe(delay(250));
    }

    return of(!this.employeeIdRegistry.has(normalized)).pipe(delay(450));
  }

  employeeIdAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = String(control.value ?? '').trim();

      if (!value) {
        return of(null);
      }

      return this.checkEmployeeIdAvailability(value).pipe(
        map((isAvailable) => (isAvailable ? null : { employeeIdTaken: true })),
      );
    };
  }
}
