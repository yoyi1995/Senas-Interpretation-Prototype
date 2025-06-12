import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterIndicatorComponent } from './letter-indicator.component';

describe('LetterIndicatorComponent', () => {
  let component: LetterIndicatorComponent;
  let fixture: ComponentFixture<LetterIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
