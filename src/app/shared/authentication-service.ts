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
                if (JSON.parse(localStorage.getItem(`${result.user.uid}-firstStart`) || 'true')) {
                    localStorage.setItem(`${result.user.uid}-firstStart`, JSON.stringify(false));
                    this.ngZone.run(() => {
                        this.router.navigate(['/tabs/settings']);
                    });
                } else {
                    this.ngZone.run(() => {
                        this.router.navigate(['/tabs']);
                    });
                }
                this.setLocalUserData(result.user);
            }).catch((error) => {
                window.alert(error);
                console.error(error);
            });
    }

    public getUser(): Promise<User> {
        let user = JSON.parse(localStorage.getItem('user'));
        if (!user || (user && !user.uid)) {
            user = this.ngFireAuth.user.toPromise().then( res => this.setLocalUserData(res));
        }
        return Promise.resolve(user);
    }

    // Sign-out
    public SignOut() {
        return this.ngFireAuth.auth.signOut().then(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('isDarkMode');
            document.body.classList.toggle('dark', false);
            this.router.navigate(['login']);
        });
    }

    // Store user in localStorage
    private setUserData(user) {
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

    private setLocalUserData(user: any) {
        if (typeof user === 'string' || user instanceof String) {
            // @ts-ignore
            user = JSON.parse(user);
        }

        const userData: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return user;
    }

}
