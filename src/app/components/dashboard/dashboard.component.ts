import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { User } from '../../models/userAccess/IUser';
import { SignedInUser } from '../../models/userAccess/ISignedInUser';
import { DataTypeConversionService } from 'src/app/service/shared/dataType-conversion.service';

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
    public convertDataType: DataTypeConversionService,
    private route: ActivatedRoute,
    private location: Location
  ) { 
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
            if(this.userAccess && this.userAccess.disableView)
            {
              if(url in this.userAccess.disableView)
              {
                this.viewDashboard = false
              }
            }
            else
            {
              this.router.navigate(['dashboard/manageFiles']);
            }
            break;
          }
          case "userProfile": {
            if(this.userAccess && this.userAccess.disableView)
            {
              if(url in this.userAccess.disableView)
              {
                this.viewDashboard = false
              }
            }
            else
            {
              this.router.navigate(['dashboard/userProfile']);
            }
            break;
          }5
        }
      }
    }
  }
  
  async getUserInfo()
  {
    let userSignedIn = await this.createSignInUser();

    if(this.authService.isLoggedIn)
    {
      if(!this.userAccess)
      {
        await this.authService.getLocalUserData();
        await this.createSignInUser();
      }

      if(this.authService.userAccess)
      {
        this.userAccess = this.authService.userAccess;
      }

      if(this.userAccess)
      {
        if(!this.convertDataType.getBoolean(this.userAccess.canLogin?.toString()))
        {
          this.viewDashboard = false
          return;
        }
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

      if(this.authService.userData){
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
        else
        {
          if(!this.signedInUser || !this.signedInUser.Uid || !this.signedInUser.User || !this.signedInUser.User.uid || !this.signedInUser.UserAccess)
          {
            this.createSignInUser();
          }
        }
    }
  }

  async createSignInUser(){
    
    const _signedInUser = JSON.parse(localStorage.getItem('signedInUser'));
    const _user = JSON.parse(localStorage.getItem('user'));
    this.userAccess = JSON.parse(localStorage.getItem('userAccess'));

    if(_user){
      this.user = {
        uid: _user.uid ??_signedInUser?.uid,
        displayName: _user.displayName ?? _signedInUser?.displayName,
        email: _user?.email ?? _signedInUser?.email,
        emailVerified: _user?.emailVerified ?? _signedInUser?.emailVerified,
        photoURL: _user?.photoURL ?? _signedInUser?.photoURL,
        firstName: _user?.firstName,
        lastName: _user?.lastName
        };
      };
    
    
    this.signedInUser = {
      Uid: this.user.uid?? null,
      User: this.user ?? null,
      UserAccess: this.userAccess?? null
    };

    localStorage.setItem('signedInUser', JSON.stringify(this.signedInUser));
    return this.signedInUser;
  }

}