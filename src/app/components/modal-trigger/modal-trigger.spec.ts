import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalTrigger } from './modal-trigger';

describe('ModalTrigger', () => {
  let component: ModalTrigger;
  let fixture: ComponentFixture<ModalTrigger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTrigger],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTrigger);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
