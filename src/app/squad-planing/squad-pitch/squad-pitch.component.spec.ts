import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadPitchComponent } from './squad-pitch.component';

describe('SquadPitchComponent', () => {
  let component: SquadPitchComponent;
  let fixture: ComponentFixture<SquadPitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SquadPitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquadPitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
