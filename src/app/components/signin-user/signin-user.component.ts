import { Component,Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms'; // Reactive form services
import { AuthenticationService } from '../../service/authentication.service';

@Component({
  selector: 'app-signin-user',
  templateUrl: './signin-user.component.html',
  styleUrls: ['./signin-user.component.css']
})
export class SignInUserComponent implements OnInit {

  constructor(public authenticationService: AuthenticationService, public formBuilder: FormBuilder) { }

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
      this.authenticationService.SignIn(email, password);
    }
  }
}
