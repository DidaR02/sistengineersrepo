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

  private signedInUser: SignedInUser;
  
  constructor(
    public authService: AuthenticationService
  ) { 
    
    this.authService.getLocalUserData();

    this.getUserInfo();
  }
  ngOnInit(): void {
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
            if (entries == "userProfile")
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