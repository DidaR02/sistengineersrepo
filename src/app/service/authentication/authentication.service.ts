import { Injectable, NgZone } from '@angular/core';
import { User } from '../../models/userAccess/IUser';
//import { auth } from 'firebase';
import auth from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/database';
import { Observable } from 'rxjs';
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
        //this.getLocalUserData();
    }
  
    // Sign in with email/password
    SignIn(email, password) {
      return this.afAuth.signInWithEmailAndPassword(email, password)
        .then((result) => {
          this.ngZone.run(async () => { 
            //this.GetUserAccess(result.user);
            await this.getLocalUserData();
            await this.SetUserData(result.user);
            return this.userAccess
          });
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
          this.SetUserData(user, result.user);
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
        this.SetUserData(result.user);
      }).catch((error) => {
        window.alert(error)
      })
    }
  
    /* Setting up user data when sign in with username/password,
    sign up with username/password and sign in with social auth
    provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
     SetUserData(user, userResults?: any) {
      if(user){
        if(userResults)
        {
          user.uid = userResults.uid;
        }
        
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
        const userData: User = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
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
        
        if(!user?.uid || user?.uid === "")
        {
          window.alert('Cannot get user Id from document collection or database');
          return;
        }

        this.afsDb.database.ref(`tb_user/${user.uid}`).set(
          user
        );
      }
    }

    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
     async getLocalUserData() {

      localStorage.removeItem('user');
      localStorage.removeItem('userAccess');
      localStorage.removeItem('signedInUser');

      await this.afAuth.authState.subscribe(async user => {
        if (user) {
          this.userData = user;
          localStorage.setItem('user', JSON.stringify(this.userData));
          JSON.parse(localStorage.getItem('user'));
          await this.GetUserAccess(user);
          await this.GetAndSetDbUserAccount(user);
        } else {
          localStorage.setItem('user', null);
          JSON.parse(localStorage.getItem('user'));
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

     GetUserAccess(user) {
      if(user)
      {
        localStorage.removeItem('userAccess');
        const userAccessObj = this.afsDb.database.ref('tb_userAccess/' + user?.uid);

        userAccessObj.on('value', (useAccess) => {
          this.userAccess = useAccess.val(); 
  
          localStorage.setItem('userAccess', JSON.stringify(this.userAccess));
          JSON.parse(localStorage.getItem('userAccess'));
        });
      }
    }

     async SetUserAccess(uid: string) {
      if(uid)
      {
        if(!this.userAccess)
        {
          this.userAccess = {
            uid: uid,
            canDownload: "false",
            canShare: "false",
            canLogin: "false",
            disableView: null,
            canDelete: "false",
            isAdmin: "false",
            AdminAccessLevel: "None",
            PartialAcces: null
          };
        }

        localStorage.setItem('userAccess', JSON.stringify(this.userAccess));
        JSON.parse(localStorage.getItem('userAccess'));


        await this.afsDb.database.ref('tb_userAccess/' + uid).set(
          this.userAccess
        );
      }
    }

     async GetAndSetDbUserAccount(user) {
      if(user)
      {
        const userAccount = this.afsDb.database.ref('tb_user/' + user?.uid);

        await userAccount.on('value', (snapshot) => {
          const userAccount = snapshot.val();
  
          localStorage.removeItem('user');
          localStorage.setItem('user', JSON.stringify(userAccount));
          JSON.parse(localStorage.getItem('user'));
        });
      }
    }
  }