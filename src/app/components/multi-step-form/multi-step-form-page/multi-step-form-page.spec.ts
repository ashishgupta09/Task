import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiStepFormPage } from './multi-step-form-page';

describe('MultiStepFormPage', () => {
  let component: MultiStepFormPage;
  let fixture: ComponentFixture<MultiStepFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiStepFormPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiStepFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
