import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Transaction } from './transaction';

describe('Transaction', () => {
  let component: Transaction;
  let fixture: ComponentFixture<Transaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Transaction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Transaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
