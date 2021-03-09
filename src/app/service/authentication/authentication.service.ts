import { Injectable, NgZone } from '@angular/core';
import { User } from '../../models/userAccess/IUser';
//import { auth } from 'firebase';
import auth from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserAccess } from '../../models/userAccess/IUserAccess';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userData: any; // Save logged in user data
  userAccess: UserAccess;
  
  constructor(public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public afsDb: AngularFireDatabase
    ) {
      if(this.isLoggedIn)
      {
        this.getLocalUserData();
      }
      else
      {
        this.router.navigate(['signin']);
      }
    }
  
    // Sign in with email/password
    SignIn(email, password) {
      return this.afAuth.signInWithEmailAndPassword(email, password)
        .then((result) => {
          this.ngZone.run(() => {
            this.router.navigate(['dashboard']);
          });
        
          this.GetUserAccess(result.user);
          this.GetDbUserAccount(result.user);
        }).catch((error) => {
          let errorMsg = "Error Signing in:" + error;
          window.alert(errorMsg);
        })
    }
  
    // Sign up with email/password
    SignUp(user: User, password: string) {
      return this.afAuth.createUserWithEmailAndPassword(user.email, password)
        .then((result) => {
          /* Call the SendVerificaitonMail() function when new user sign
          up and returns promise */
          this.SetFsUserData(user, result.user);
          this.SetDbUserData(user, result);
          this.SetUserAccess(result.user.uid);
          this.SendVerificationMail();
        }).catch((error) => {
          window.alert(error.message)
        })
    }
  
    // Send email verfificaiton when new user sign up
    SendVerificationMail() {
      return this.afAuth.currentUser.then(verify => verify.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      })
    }
  
    // Reset Forggot password
    ForgotPassword(passwordResetEmail) {
      if(passwordResetEmail)
      {
        return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
        .then(() => {
          window.alert('Password reset email sent, check your inbox.');
        }).catch((error) => {
          window.alert(error)
        });
      }
      else{
        window.alert('Password reset email not sent, check your inbox. Please enter valid password.');
      }
    }
  
    // Returns true when user is looged in and email is verified
    get isLoggedIn(): boolean {
      const user = JSON.parse(localStorage.getItem('user'));
      return (user !== null && user.emailVerified !== false) ? true : false;
    }
  
    // Sign in with Google
    GoogleAuth() {
      return this.AuthLogin(new auth.auth.GoogleAuthProvider());
    }
  
    // Auth logic to run auth providers
    AuthLogin(provider) {
      return this.afAuth.signInWithPopup(provider)
      .then((result) => {
         this.ngZone.run(() => {
            this.router.navigate(['dashboard']);
          })
        this.SetFsUserData(result.user);
      }).catch((error) => {
        window.alert(error)
      })
    }
  
    /* Setting up user data when sign in with username/password,
    sign up with username/password and sign in with social auth
    provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
     SetFsUserData(user, userResults?: any) {
      if(user){
        if(userResults)
        {
          user.uid = userResults.uid;
        }
        
        if(user.firstName || user.lastName)
        {
          user.displayName = user.firstName.substring(0,1).toUpperCase() + ", " + user.lastName;
        }

        const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
        const userData: User = {
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          emailVerified: user.emailVerified ?? false,
          firstName: user.firstName?? null,
          lastName: user.lastName?? null
        }
        return userRef.set(userData, {
          merge: true
        });
      }
    }

     SetDbUserData(user, userResults?: any) {
      if(user){
        if(userResults?.user)
        {
          user.uid = userResults.user.uid;
        }
                
        if(user.firstName || user.lastName)
        {
          user.displayName = user.firstName.substring(0,1).toUpperCase() + ", " + user.lastName;
        }

        if(!user?.uid || user?.uid === "")
        {
          window.alert('Cannot get user Id from document collection or database');
          return;
        }

        const userData: User = {
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          emailVerified: user.emailVerified ?? false,
          firstName: user.firstName?? null,
          lastName: user.lastName?? null
        }
        this.afsDb.database.ref(`tb_user/${user.uid}`)
        .set(userData);
      }
    }

    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
     getLocalUserData() {

      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.ngZone.run(async () => {
            
          this.GetUserAccess(user);
          this.GetDbUserAccount(user);
          
          localStorage.setItem('signedInUser', JSON.stringify(user));
          JSON.parse(localStorage.getItem('signedInUser'));

          });
          
        } else {
          localStorage.setItem('user', null);
          localStorage.setItem('signedInUser', null);
          localStorage.setItem('userAccess', null);
        }
      })
    }
  
    // Sign out
     SignOut() {
      return this.afAuth.signOut().then(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('userAccess');
        localStorage.removeItem('signedInUser');
        this.router.navigate(['sign-in']);
      })
    }

     GetUserAccess(user) : UserAccess {
      if(user)
      {
        const userAccessObj = this.afsDb.database.ref('tb_userAccess/' + user?.uid);

         userAccessObj.on('value', (useAccess) => {
          this.userAccess = useAccess.val(); 
  
          localStorage.setItem('userAccess', JSON.stringify(this.userAccess));
          JSON.parse(localStorage.getItem('userAccess'));

          return this.userAccess;
        });
        return this.userAccess;
      }
    }

     SetUserAccess(uid: string) : UserAccess{
      if(uid)
      {
        if(!this.userAccess)
        {
          this.userAccess = {
            uid: uid,
            canAddFile: "false",
            canCreateFolder: "string",
            canDownload: "false",
            canShare: "false",
            canLogin: "true",
            disableView: null,
            canDelete: "false",
            isAdmin: "false",
            adminAccessLevel: "noAccess",
            partialAccess: null
          };
        }

        localStorage.setItem('userAccess', JSON.stringify(this.userAccess));
        JSON.parse(localStorage.getItem('userAccess'));


        this.afsDb.database.ref('tb_userAccess/' + uid).set(
          this.userAccess
        );
        return this.userAccess;
      }
    }

     GetDbUserAccount(user) {
      if(user)
      {
        const userAccount = this.afsDb.database.ref('tb_user/' + user?.uid);

        userAccount.on('value', (snapshot) => {
          const userAccount = snapshot.val();

          localStorage.setItem('user', JSON.stringify(userAccount));
          //this.userData
          return JSON.parse(localStorage.getItem('user'));
        });
      }
    }
  }