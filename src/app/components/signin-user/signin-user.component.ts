import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms'; // Reactive form services
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { DataTypeConversionService } from 'src/app/service/shared/dataType-conversion.service';
// import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { ActivatedRoute, Event as RouterEvent, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import {ThemePalette} from '@angular/material/core';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signin-user',
  templateUrl: './signin-user.component.html',
  styleUrls: ['./signin-user.component.css']
})
export class SignInUserComponent implements OnInit {

  isUserSignInAllowed : boolean = true;
 public showOverlay = false;
  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public convertDataType: DataTypeConversionService
  ) {
      router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    });
    }

  ngOnInit() {
  }

  public signInFormGroup = new FormGroup({
    Email: new FormControl(),
    Password: new FormControl()
  });

   // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.showOverlay = true;
    }
    if (event instanceof NavigationEnd) {
      this.showOverlay = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.showOverlay = false;
    }
    if (event instanceof NavigationError) {
      this.showOverlay = false;
    }
  }

  async submitSignInDetails()
  {
    this.showOverlay = true;

    this.isUserSignInAllowed = true;

    var signInDetails = this.signInFormGroup?.value;
    let email = signInDetails?.Email;
    let password = signInDetails?.Password;

    if(email && password)
    {
      let response = this.authService.SignIn(email, password);
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
