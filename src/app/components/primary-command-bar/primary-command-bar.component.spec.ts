import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryCommandBarComponent } from './primary-command-bar.component';

describe('PrimaryCommandBarComponent', () => {
  let component: PrimaryCommandBarComponent;
  let fixture: ComponentFixture<PrimaryCommandBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrimaryCommandBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimaryCommandBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
