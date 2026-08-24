export interface EmployeeDetails {
    employeeId: number | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    department: string | null;
    designation: string | null;
    location: string | null;
    joiningDate: string | null | null;
    employmentType: string | null;
    manager: string | null;
    salary: number | null;
    status: string | null;
    skills: string[] | null;
    isRemote: boolean | null;
}