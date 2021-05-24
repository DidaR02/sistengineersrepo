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

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  
  userList: Observable<User[]>;
  userListRef: AngularFireList<any>;    // Reference to UsersList data list, its an Observable

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
  }