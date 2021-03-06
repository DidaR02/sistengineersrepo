import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { User } from 'src/app/models/userAccess/IUser';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { DataTypeConversionService} from '../../service/shared/dataType-conversion.service'
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { UserManagerService } from 'src/app/service/authentication/userManager.service';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  @Input() userList: User[];
  @Input() userAccess: UserAccess;
  selectedUser: User;
  canDownload: string;
  canShare: string;
  canLogin: string;
  disableView: string[];
  canDelete: string;
  isAdmin: string;
  adminAccessLevel: string;
  firstName: string;
  lastName: string;
  saveComplete: boolean = false;

  constructor(
    public dataTypeConv: DataTypeConversionService, 
    public authService: AuthenticationService,
    public userManagerService: UserManagerService) { }

  ngOnInit(): void {
  }

  public manageUserGroups= new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    canDownload: new FormControl(),
    canShare: new FormControl(),
    canLogin: new FormControl(),
    disableView: new FormControl(),
    canDelete: new FormControl(),
    isAdmin: new FormControl(),
    adminAccessLevel: new FormControl()
  });

  onSelect(user: User, userAccess: UserAccess): void {
    this.selectedUser = user;
    this.canDownload = userAccess.canDownload;
    this.canShare = userAccess.canShare;
    this.canLogin = userAccess.canLogin;
    this.disableView = userAccess.disableView;
    this.canDelete = userAccess.canDelete;
    this.isAdmin = userAccess.isAdmin;
    this.adminAccessLevel = userAccess.adminAccessLevel;

    this.setupControlModel();
  }

  setupControlModel(){
    this.manageUserGroups.patchValue(
      {
        firstName: this.selectedUser?.firstName?.toString(),
        lastName: this.selectedUser?.lastName?.toString(),
        canDownload: this.dataTypeConv.getStringBoolean(this.canDownload?.toString()),
        canShare: this.dataTypeConv.getStringBoolean(this.canShare?.toString()),
        canLogin: this.dataTypeConv.getStringBoolean(this.canLogin?.toString()),
        canDelete: this.dataTypeConv.getStringBoolean(this.canDelete?.toString()),
        isAdmin: this.dataTypeConv.getStringBoolean(this.isAdmin?.toString()),
        adminAccessLevel: this.adminAccessLevel?.toString()
      }
    );
  }

  submitUserDetails(){
    const userDetails = this.manageUserGroups.value;
    if(userDetails)
    {
      this.selectedUser.firstName = userDetails.firstName;
      this.selectedUser.lastName = userDetails.lastName;
      this.userAccess.canDownload = userDetails.canDownload;
      this.userAccess.canShare = userDetails.canShare;
      this.userAccess.canLogin = userDetails.canLogin;
      this.userAccess.disableView = userDetails.disableView;
      this.userAccess.canDelete = userDetails.canDelete;
      this.userAccess.isAdmin = userDetails.isAdmin;
      this.userAccess.adminAccessLevel = userDetails.adminAccessLevel;

      this.authService.SetFsUserData(this.selectedUser);
      this.authService.SetDbUserData(this.selectedUser);
      this.authService.userAccess = this.userAccess;
      this.authService.SetUserAccess(this.authService.userAccess.uid);

      this.saveComplete = true
    }
  }

  resetMsg()
  {
    this.saveComplete = false;
  }
}
