import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDetails } from './game-details';

describe('GameDetails', () => {
  let component: GameDetails;
  let fixture: ComponentFixture<GameDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
