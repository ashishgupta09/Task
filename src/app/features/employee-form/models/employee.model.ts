export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Internship';
export type AccountStatus = 'Active' | 'Pending' | 'Disabled' | 'Suspended';

export interface EducationRecord {
  qualification: string;
  university: string;
  passingYear: number;
  percentage: number;
  grade: string;
}

export interface WorkExperienceRecord {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
}

export interface SkillRecord {
  skillName: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

export interface EmployeeRegistrationModel {
  personalInfo: {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: Gender;
    profilePicture: File | null;
    address: string;
    country: string;
    state: string;
    city: string;
    pinCode: string;
  };
  professionalInfo: {
    employeeId: string;
    department: string;
    designation: string;
    joiningDate: string;
    employmentType: EmploymentType;
    workLocation: string;
    reportingManager: string;
    salary: number;
    yearsOfExperience: number;
    contractEndDate: string;
  };
  educationDetails: EducationRecord[];
  workExperience: WorkExperienceRecord[];
  skills: SkillRecord[];
  accountInformation: {
    username: string;
    password: string;
    confirmPassword: string;
    accountStatus: AccountStatus;
    termsAndConditions: boolean;
  };
}
