export const STORAGE_KEY = 'multi_step_form_draft';

export interface PersonalFormDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface FormState {
    personalDetails: PersonalFormDetails;
    currentStep: number;
}

export const INITIAL_STATE: FormState = {
    personalDetails: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    },
    currentStep: 1
}