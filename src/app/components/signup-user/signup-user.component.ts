import { Component,Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms'; // Reactive form services
import { AuthenticationService } from '../../service/authentication.service';

@Component({
  selector: 'app-signup-user',
  templateUrl: './signup-user.component.html',
  styleUrls: ['./signup-user.component.css']
})
export class SignUpUserComponent implements OnInit {

  constructor(public authenticationService: AuthenticationService) { }

  ngOnInit(): void {
  }

  public signUpFormGroup= new FormGroup({
    FirstName: new FormControl(),
    LastName: new FormControl(),
    Email: new FormControl(),
    Password: new FormControl()
  });

  submitSigUpDetails()
  {
    const signUpDetails = this.signUpFormGroup.value;
    let email = signUpDetails.Email;
    let password = signUpDetails.Password;
    if(email && password)
    {
      this.authenticationService.SignUp(email, password);
    }
  }
}
