import { Service } from '@angular/core';
import { EmployeeDetails } from '../models/employee.model';
import { Observable, of } from 'rxjs';

@Service()
export class Employee {

    updateEmployee(employee: EmployeeDetails): Observable<EmployeeDetails> {
        console.log('API Request:', employee);
        return of(employee);
    }

    deleteEmployee(employeeId: number): Observable<boolean> {
        console.log('Delete employee:', employeeId);
        return of(true)
    }

}
