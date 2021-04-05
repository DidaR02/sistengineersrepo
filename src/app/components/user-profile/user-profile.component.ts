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
    // if(this.authService?.isLoggedIn)
    // {
      //this.authService.getLocalUserData();
      this.refreshAll();
    // }
    // else
    // {
    //   this.router.navigate(['signin']);
    // }
  }

  ngOnInit(): void {
    // if(this.authService?.isLoggedIn)
    // {
     // this.authService.getLocalUserData();
     this.refreshAll();
    // }
    // else
    // {
    //   this.router.navigate(['signin']);
    // }
  }
  
  async refreshAll()
  {
    this.getUserInfo();
    this.GetAllUsers();
  }

  async getUserInfo()
  {
    await this.createSignInUser();

    if(this.authService?.isLoggedIn)
    {
      if(!this.userAccess)
      {
        this.authService.getLocalUserData();
        await this.createSignInUser();
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
    
      if(this.user){
        this.signedInUser = {
        Uid: this.user.uid?? null,
        User: this.user ?? null,
        UserAccess: this.userAccess?? null
      };
    }

    localStorage.setItem('signedInUser', JSON.stringify(this.signedInUser));
    return this.signedInUser;
  }

  async GetAllUsers()
  {
    if(this.userAccess?.isAdmin)
    {
      let users = this.userManagerService.GetAllUsers();
      console.log(this.userList);

      users.snapshotChanges().subscribe(data =>{
        this.userList = [];
        data.forEach(currentUser => {

          let a = currentUser.payload.toJSON();
          a['uid'] = currentUser.key;

          this.setupUser(a);

          //this.userList.push(a as User);
        })
      })
    }
  }

  setupUser(user){

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