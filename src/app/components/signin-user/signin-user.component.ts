import { Component,Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms'; // Reactive form services
import { AuthenticationService } from 'src/app/Service/authentication/authentication.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-signin-user',
  templateUrl: './signin-user.component.html',
  styleUrls: ['./signin-user.component.css']
})
export class SignInUserComponent implements OnInit {

  constructor(public authService: AuthenticationService, public formBuilder: FormBuilder,public router: Router,) {}

  ngOnInit(): void {
  }

  public signInFormGroup = new FormGroup({
    Email: new FormControl(),
    Password: new FormControl()
  });

  submitSignInDetails()
  {
    var signInDetails = this.signInFormGroup?.value;
    let email = signInDetails?.Email;
    let password = signInDetails?.Password;
    if(email && password)
    {
      this.authService.SignIn(email, password);
    }
  }
}
