import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpUserComponent } from './signup-user.component';

describe('SignupUserComponent', () => {
  let component: SignUpUserComponent;
  let fixture: ComponentFixture<SignUpUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignUpUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
