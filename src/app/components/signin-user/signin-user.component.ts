import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms'; // Reactive form services
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { Router } from "@angular/router";
import { DataTypeConversionService } from 'src/app/service/shared/dataType-conversion.service';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

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
    var signInDetails = this.signInFormGroup?.value;
    let email = signInDetails?.Email;
    let password = signInDetails?.Password;

    if(email && password)
    {
      await this.authService.SignIn(email, password);

      if(!this.authService.userAccess.canLogin)
      {
        this.isUserSignInAllowed = this.convertDataType.getBoolean(this.authService.userAccess.canLogin)
      }
      else{
        this.router.navigate(['dashboard']);
      }
    }
  }

  redirectToRegister()
  {
    this.router.navigate(['register-user']);
  }

  resetErrorMsg()
  {
    this.isUserSignInAllowed = true;
  }
}
