import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {auth} from 'firebase';

import {User} from './user';

@Injectable({
    providedIn: 'root'
})

export class AuthenticationService {
    userData: any;

    constructor(
        public afStore: AngularFirestore,
        public ngFireAuth: AngularFireAuth,
        public router: Router,
        public ngZone: NgZone
    ) {
        this.ngFireAuth.authState.subscribe(user => {
            if (user) {
                this.userData = user;
                this.setLocalUserData(JSON.stringify(this.userData));
                JSON.parse(localStorage.getItem('user'));
            } else {
                this.setLocalUserData(null);
                JSON.parse(localStorage.getItem('user'));
            }
        });
    }

    // Returns true when user is looged in
    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return (user !== null && user.emailVerified !== false) ? true : false;
    }

    // Returns true when user's email is verified
    get isEmailVerified(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return (user.emailVerified !== false) ? true : false;
    }

    setLocalUserData(userData: any) {
        localStorage.setItem('user', userData);
    }

    // Login in with email/password
    SignIn(email, password) {
        return this.ngFireAuth.auth.signInWithEmailAndPassword(email, password);
    }

    // Register user with email/password
    RegisterUser(email, password) {
        return this.ngFireAuth.auth.createUserWithEmailAndPassword(email, password);
    }

    // Email verification when new user register
    SendVerificationMail() {
        return this.ngFireAuth.auth.currentUser.sendEmailVerification()
            .then(() => {
                this.router.navigate(['verify-email']);
            });
    }

    // Recover password
    PasswordRecover(passwordResetEmail) {
        return this.ngFireAuth.auth.sendPasswordResetEmail(passwordResetEmail)
            .then(() => {
                window.alert('Password reset email has been sent, please check your inbox.');
            }).catch((error) => {
                window.alert(error);
            });
    }

    // Sign in with Gmail
    GoogleAuth() {
        return this.AuthLogin(new auth.GoogleAuthProvider());
    }

    FacebookAuth() {
        return this.AuthLogin(new auth.FacebookAuthProvider());
    }

    // Auth providers
    AuthLogin(provider) {
        return this.ngFireAuth.auth.signInWithPopup(provider)
            .then((result) => {
                if (JSON.parse(localStorage.getItem(`${ result.user.uid}-firstStart`) || 'true')) {
                    localStorage.setItem(`${ result.user.uid}-firstStart`, JSON.stringify(false));
                    this.ngZone.run(() => {
                        this.router.navigate(['/tabs/tab3']);
                    });
                } else {
                    this.ngZone.run(() => {
                        this.router.navigate(['/tabs']);
                    });
                }
                // this.SetUserData(result.user);
            }).catch((error) => {
                window.alert(error);
                console.error(error);
            });
    }

    // Store user in localStorage
    SetUserData(user) {
        const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
        const userData: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
        return userRef.set(userData, {
            merge: true
        });
    }

    // Sign-out
    SignOut() {
        return this.ngFireAuth.auth.signOut().then(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('isDarkMode');
            document.body.classList.toggle('dark', false);
            this.router.navigate(['login']);
        });
    }

}
