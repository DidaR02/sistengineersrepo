import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SignedInUser } from 'src/app/models/userAccess/ISignedInUser';
import { User } from 'src/app/models/userAccess/IUser';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { UserManagerService } from 'src/app/service/authentication/userManager.service';
import { UserListComponent } from '../user-list/user-list.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User;
  userAccess: UserAccess;
  viewDashboard: boolean = true;

  signedInUser: SignedInUser;

  /*For UsersList*/
  p: number = 1;                      // Settup up pagination variable
  userList: User[];                 // Save students data in Student's array.
  hideWhenNoUsers: boolean = false; // Hide students data table when no student.
  noData: boolean = false;            // Showing No Student Message, when no student in database.
  preLoader: boolean = true;
  /*End UsersList*/

  constructor(
    public authService: AuthenticationService,
    public userManagerService: UserManagerService,
    public router: Router
  ) {
      // this.refreshAll();
  }

  ngOnInit() {
     this.refreshAll();
  }

  async refreshAll()
  {
    await this.getUserInfo();
    await this.GetAllUsers();
  }

  async getUserInfo()
  {
    this.userManagerService.createSignInUser();

    if(this.authService?.isLoggedIn)
    {
      if(!this.userAccess)
      {
        //this.authService.getLocalUserData();
        this.userManagerService.createSignInUser();
      }

      if(this.authService?.userAccess)
      {
        this.userAccess = this.authService?.userAccess;
      }

      if(this.userAccess)
      {
        //if user cant view dashboard, redirect user to no access page.
        if(this.userAccess?.disableView)
        {
          let dashBoardAccess: string[] = this.userAccess?.disableView;
          for( var entries in dashBoardAccess) {
            if (entries == "userProfile")
            {
              this.viewDashboard = false
            }
          };
        }
      }

      if(this.userManagerService.user){
        this.user = {
          uid: this.userManagerService.user?.uid,
          displayName: this.userManagerService.user?.displayName,
          email: this.userManagerService.user?.email,
          emailVerified: this.userManagerService.user?.emailVerified,
          photoURL: this.userManagerService.user?.photoURL,
          firstName: this.userManagerService.user?.firstName,
          lastName: this.userManagerService.user?.lastName
        };

        this.signedInUser = {
          Uid: this.userManagerService.user?.uid,
          User: this.user,
          UserAccess: this.userAccess
        };

        localStorage.setItem('signedInUser', JSON.stringify(this.signedInUser));
        }
        else
        {
          if(!this.signedInUser || !this.signedInUser.Uid || !this.signedInUser.User || !this.signedInUser.User.uid || !this.signedInUser.UserAccess)
          {
            this.userManagerService.createSignInUser();
          }
        }
    }
  }

  async GetAllUsers()
  {
    if(this.userAccess?.isAdmin)
    {
      let users = this.userManagerService.GetAllUsers();
      console.log(this.userList);

      users.snapshotChanges().subscribe(async data => {
        this.userList = [];
        data.forEach(async currentUser => {
          let a: any = currentUser.payload.toJSON();
          a['uid'] = currentUser.key;
          this.setupUser(a as User);
        })
      });
      return this.userList;
    }
    return this.userList;
  }

  setupUser(user: User){

    const userData: User = {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      emailVerified: user.emailVerified ?? false,
      firstName: user.firstName?? null,
      lastName: user.lastName?? null
    }

    this.userList.push(userData as User);
  }
  // Using valueChanges() method to fetch simple list of students data. It updates the state of hideWhenNoStudent, noData & preLoader variables when any changes occurs in student data list in real-time.
  dataState() {
    this.userManagerService.GetAllUsers().valueChanges().subscribe(data => {
      this.preLoader = false;
      if(data.length <= 0){
        this.hideWhenNoUsers = false;
        this.noData = true;
      } else {
        this.hideWhenNoUsers = true;
        this.noData = false;
      }
    })
  }
}
