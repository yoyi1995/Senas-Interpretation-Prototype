import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectionHistoryComponent } from './detection-history.component';

describe('DetectionHistoryComponent', () => {
  let component: DetectionHistoryComponent;
  let fixture: ComponentFixture<DetectionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetectionHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetectionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
