import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { User } from '../../models/userAccess/IUser';
import { SignedInUser } from '../../models/userAccess/ISignedInUser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User;
  private userData: any;
  private userAccess: UserAccess;
  viewDashboard: boolean = true;

  private signedInUser: SignedInUser;

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { 
    
    this.authService.getLocalUserData();

    this.getUserInfo();
  }

  ngOnInit(): void {
    
  }
  async clickNavigateHandler(url: string)
  {
    if (this.viewDashboard)
    {
      if(url.length > 0)
      {
        switch(url){
          case "manageFiles": {
            if(this.userAccess &&  ("manageFiles" in this.userAccess.disableView))
            {
              this.viewDashboard = false
            }
            else
            {
              this.router.navigate(['dashboard/manageFiles']);
            }
            break;
          }
          case "userProfile": {
            if(this.userAccess &&  ("userProfile" in this.userAccess.disableView))
            {
              this.viewDashboard = false
            }
            else
            {
              this.router.navigate(['dashboard/userProfile']);
            }
            break;
          }
        }
      }
    }
  }
  
  async getUserInfo()
  {
    if(this.authService.isLoggedIn)
    {
      var xUserAccess = JSON.parse(localStorage.getItem('userAccess'));
      if(!this.userAccess)
      {
        this.userAccess = xUserAccess;
      }

      if(this.authService.userAccess)
      {
        this.userAccess = this.authService.userAccess;
      }

      if(this.userAccess)
      {
        //if user cant view dashboard, redirect user to no access page.
        if(this.userAccess.disableView)
        {
          let dashBoardAccess: string[] = this.userAccess.disableView;
          for( var entries in dashBoardAccess) {
            if (entries == "dashboard")
            {
              this.viewDashboard = false
            }
          };
        }
      }

      this.user = {
      uid: this.authService.userData?.uid,
      displayName: this.authService.userData?.displayName,
      email: this.authService.userData?.email,
      emailVerified: this.authService.userData?.emailVerified,
      photoURL: this.authService.userData?.photoURL,
      firstName: this.authService.userData?.firstName,
      lastName: this.authService.userData?.lastName
      };

      this.signedInUser = {
        Uid: this.authService.userData?.uid,
        User: this.user,
        UserAccess: this.userAccess
      };

      localStorage.setItem('signedInUser', JSON.stringify(this.signedInUser));
      JSON.parse(localStorage.getItem('signedInUser'));
    }
  }

}