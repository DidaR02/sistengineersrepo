import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbAlertComponent } from './ngb-alert.component';

describe('NgbAlertComponent', () => {
  let component: NgbAlertComponent;
  let fixture: ComponentFixture<NgbAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
