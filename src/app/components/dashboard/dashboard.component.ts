import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserAcess } from 'src/app/models/userAccess/IUserAcess';
import { AuthenticationService } from 'src/app/Service/authentication/authentication.service';
import { User } from '../../models/userAccess/IUser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

   user: User;
  private userData: any;
  private userAccess: UserAcess;
  public viewDashboard: boolean;

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { 
    this.getUserInfo();
  }

  ngOnInit(): void {
    
  }
  async clickNavigateHandler(url: string)
  {
    if(url.length > 0)
    {
      switch(url){
        case "manageFiles": {
          this.router.navigate(['dashboard/manageFiles']);
          break;
        }
        case "viewSales": {
          this.router.navigate(['dashboard/viewsales']);
          break;
        }
      }
    }
  }
  
  getUserInfo()
  {
    if(this.authService.isLoggedIn)
    {
      this.authService.getLocalUserData();

      this.userData = this.authService.userData;
      this.userAccess = this.authService.userAccess;

      if(this.userAccess && this.userAccess.disableView)
      {
        //if user cant view dashboard, redirect user to no access page.
        let dashBoardAccess: string[] = this.userAccess.disableView;
        for( var entries in dashBoardAccess) {
          if (entries == "dashboard")
          {
            console.log("You do not have any access to view",entries);
          }
        };
      }

      let newUser = {
      uid: this.userData?.uid,
      displayName: this.userData?.displayName,
      email: this.userData?.email,
      emailVerified: this.userData?.emailVerified,
      photoURL: this.userData?.photoURL
      };

      this.user = newUser;
    }
  }
}