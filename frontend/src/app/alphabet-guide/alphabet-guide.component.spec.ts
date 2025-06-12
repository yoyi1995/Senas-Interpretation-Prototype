import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphabetGuideComponent } from './alphabet-guide.component';

describe('AlphabetGuideComponent', () => {
  let component: AlphabetGuideComponent;
  let fixture: ComponentFixture<AlphabetGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphabetGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlphabetGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
