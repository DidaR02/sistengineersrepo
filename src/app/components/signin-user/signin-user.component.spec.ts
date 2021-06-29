import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInUserComponent } from './signin-user.component';

describe('signIn-UserComponent', () => {
  let component: SignInUserComponent;
  let fixture: ComponentFixture<SignInUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
