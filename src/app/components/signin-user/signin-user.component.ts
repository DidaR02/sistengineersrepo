import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms'; // Reactive form services
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { Router } from "@angular/router";
import { DataTypeConversionService } from 'src/app/service/shared/dataType-conversion.service';
// import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';

@Component({
  selector: 'app-signin-user',
  templateUrl: './signin-user.component.html',
  styleUrls: ['./signin-user.component.css']
})
export class SignInUserComponent implements OnInit {

  isUserSignInAllowed : boolean = true;

  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public convertDataType: DataTypeConversionService
    ) {}

  ngOnInit(): void {
  }

  public signInFormGroup = new FormGroup({
    Email: new FormControl(),
    Password: new FormControl()
  });


  async submitSignInDetails()
  {
    this.isUserSignInAllowed = true;

    var signInDetails = this.signInFormGroup?.value;
    let email = signInDetails?.Email;
    let password = signInDetails?.Password;

    if(email && password)
    {
      let response = this.authService.SignIn(email, password);
      console.log("final response :",response);
      //   .then(
      //   (canSignIn) => {
      //     if (canSignIn)
      //     {
      //       console.log("User has signed in successfully : ", canSignIn);
      //       this.isUserSignInAllowed = true;
      //     }
      //     else {
      //       if (this.authService.userAccess)
      //       {
      //         this.isUserSignInAllowed = this.convertDataType.getBoolean(this.authService.userAccess.canLogin);
      //       }
      //     }
      //   }
      // ).catch(
      //   (exception) => {
      //     throw exception;
      //   }
      // );
    }
    else
    {
      this.isUserSignInAllowed = false;
    }
  }

  redirectToRegister()
  {
    this.router.navigate(['register-user']);
  }

  resetPassword(){
    this.router.navigate(['forgotPassword']);
  }

  resetErrorMsg()
  {
    this.isUserSignInAllowed = true;
  }
}
