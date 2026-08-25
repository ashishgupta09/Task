import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormState, INITIAL_STATE, PersonalFormDetails, STORAGE_KEY } from '../interfaces/forms-details';

@Injectable({ providedIn: 'root' })

export class FormDraftStore {

    private readonly _formState$ = new BehaviorSubject<FormState>(
        this.loadFromStorage() ?? { ...INITIAL_STATE }
    );

    readonly formState$ = this._formState$.asObservable();

    readonly formSignalState = signal<FormState>(
        this.loadFromStorage() ?? { ...INITIAL_STATE }
    )

    readonly fullName = computed(() => {
        const { firstName, lastName } = this.formSignalState().personalDetails;
        return `${firstName} ${lastName}`.trim();
    })

    readonly currentStep = computed(() => this.formSignalState().currentStep)

    private loadFromStorage(): FormState | null {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as FormState) : null;
        } catch {
            return null;
        }
    }

    // form steps

    goToStep(step: number) {
        const next: FormState = { ...this._formState$.value, currentStep: step };
        this._push(next);
    }

    //  functions add and update

    submit(): void {
        const state = this._formState$.value;
        console.log('[FormDataService] Submitting form data:', state.personalDetails);
        this._clearStorage();
        this.reset();
    }

    updatePersonalDetails(details: PersonalFormDetails) {
        const next: FormState = {
            ...this._formState$.value,
            personalDetails: { ...details },
        };
        this._push(next);
    }

    // storega add, update and remove funtions

    _push(state: FormState) {
        this._formState$.next(state);
        this.formSignalState.set(state);
        this._saveToStorage(state);
    }

    _saveToStorage(state: FormState) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch { }
    }

    reset(): void {
        this._push({ ...INITIAL_STATE });
        this._clearStorage()
    }

    private _clearStorage() {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch { }
    }
}
