import { stringify } from '@angular/compiler/src/util';
import { Component,OnInit } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms'; // Reactive form services
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { User } from '../../models/userAccess/IUser'

@Component({
  selector: 'app-signup-user',
  templateUrl: './signup-user.component.html',
  styleUrls: ['./signup-user.component.css']
})
export class SignUpUserComponent implements OnInit {

  isPasswordValid : boolean = true;

  constructor(public authenticationService: AuthenticationService, public router: Router) { }

  ngOnInit(): void {
  }

  public signUpFormGroup= new FormGroup({
    FirstName: new FormControl(),
    LastName: new FormControl(),
    Email: new FormControl(),
    Password: new FormControl(),
    ConfirmEmail: new FormControl(),
    ConfirmPassword: new FormControl()
  });

  submitSigUpDetails()
  {
    const signUpDetails = this.signUpFormGroup.value;
    if(signUpDetails.ConfirmPassword != signUpDetails.Password)
    {
      this.isPasswordValid = false;
    }
    else
    {
      if(signUpDetails.Email && signUpDetails.Password && signUpDetails.LastName && signUpDetails.LastName)
      {
        let fName: string = signUpDetails.LastName;
        const newUser: User = {
          uid : null,
          firstName : signUpDetails.FirstName,
          lastName : signUpDetails.LastName,
          displayName : fName.substring(0,1).toUpperCase() + ", " +signUpDetails.LastName,
          email : signUpDetails.Email,
          emailVerified : false,
          photoURL: null
        };

        this.authenticationService.SignUp(newUser, signUpDetails.Password);
      }
    }
  }

  resetErrorMsg()
  {
    this.isPasswordValid = true;
  }

  redirectToSignin()
  {
    this.router.navigate(['signin']);
  }
}
