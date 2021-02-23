import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators,FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication.service';
import { User } from '../../service/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public user: User;
  private userData: any;

  constructor(public authService: AuthenticationService) { 
    this.getUserInfo();
  }

  ngOnInit(): void {
    
  }

  getUserInfo()
  {
    if(this.authService.isLoggedIn)
    {
      //this.authService.getLocalUserData();

      this.userData = this.authService.userData;
      
      let ssss: User = {
      uid: this.userData?.uid,
      displayName: this.userData?.displayName,
      email: this.userData?.email,
      emailVerified: this.userData?.emailVerified,
      photoURL: this.userData?.photoURL
      }

      this.user = ssss;
    }
  }
}
