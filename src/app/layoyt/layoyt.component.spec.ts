import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoytComponent } from './layoyt.component';

describe('LayoytComponent', () => {
  let component: LayoytComponent;
  let fixture: ComponentFixture<LayoytComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoytComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoytComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
