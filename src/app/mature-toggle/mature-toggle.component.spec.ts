import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatureToggleComponent } from './mature-toggle.component';

describe('MatureToggleComponent', () => {
  let component: MatureToggleComponent;
  let fixture: ComponentFixture<MatureToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatureToggleComponent]
    });
    fixture = TestBed.createComponent(MatureToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
