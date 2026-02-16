import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountForm } from './discount-form';

describe('DiscountForm', () => {
  let component: DiscountForm;
  let fixture: ComponentFixture<DiscountForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiscountForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
