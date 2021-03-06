import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SignedInUser } from 'src/app/models/userAccess/ISignedInUser';
import { User } from 'src/app/models/userAccess/IUser';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User;

  private userAccess: UserAccess;
  viewDashboard: boolean = true;

  signedInUser: SignedInUser;
  
  constructor(
    public authService: AuthenticationService
  ) {
    this.createSignInUser();
    this.authService.getLocalUserData();
  }

  ngOnInit(): void {
    this.getUserInfo();
  }
  

  async getUserInfo()
  {
    let userSignedIn = await this.createSignInUser();

    if(this.authService.isLoggedIn)
    {
      if(!this.userAccess)
      {
        this.authService.getLocalUserData();
        await this.createSignInUser();
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
            if (entries == "userProfile")
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
    
    _signedInUser.User = this.user;
    _signedInUser.UserAccess = this.userAccess ;

    this.signedInUser = {
      Uid: _signedInUser.User.uid,
      User: _signedInUser.User,
      UserAccess: _signedInUser.UserAccess
    };

    return this.signedInUser;
  }
}