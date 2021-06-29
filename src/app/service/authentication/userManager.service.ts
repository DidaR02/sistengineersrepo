import { Injectable, NgZone } from '@angular/core';
import { User } from '../../models/userAccess/IUser';
//import { auth } from 'firebase';
import auth from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList,AngularFireDatabaseModule } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserAccess } from '../../models/userAccess/IUserAccess';
import { AuthenticationService } from '../../service/authentication/authentication.service';
import { SignedInUser } from 'src/app/models/userAccess/ISignedInUser';

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {

  userList: Observable<User[]>;
  userListRef: AngularFireList<any>;    // Reference to UsersList data list, its an Observable
  public userAccess: UserAccess;
  public user: User;
  public signedInUser: SignedInUser;

  constructor(public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public afsDb: AngularFireDatabase,
    public authService: AuthenticationService
    ){
    }

    GetAllUsers() {
      this.userListRef = this.afsDb.list('tb_user');
      return this.userListRef;
  }

    async createSignInUser(){

    let signedInUser = localStorage.getItem('signedInUser')
    let userDetails = localStorage.getItem('user');
    let userAccessDetails = localStorage.getItem('userAccess');

    const _signedInUser = signedInUser ? JSON.parse(signedInUser) : '';
    const _user : User = userDetails ? JSON.parse(userDetails) : null;
    this.userAccess = userAccessDetails ? JSON.parse(userAccessDetails): null;

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

    localStorage.setItem('signedInUser', signedInUser ? JSON.stringify(this.signedInUser) : '');
    return this.signedInUser;
  }
  }
