import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { Platform } from '@ionic/angular';
import { auth, User } from 'firebase';
import { AppUser } from './appUser';
import AuthProvider = auth.AuthProvider;
import GoogleAuthProvider = auth.GoogleAuthProvider;
import FacebookAuthProvider = auth.FacebookAuthProvider;
import UserCredential = auth.UserCredential;

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    userData: any;

    constructor(
        private platform: Platform,
        public afStore: AngularFirestore,
        public ngFireAuth: AngularFireAuth,
        public router: Router,
        public ngZone: NgZone,
        private googlePlus: GooglePlus,
        private facebook: Facebook
    ) {
        this.ngFireAuth.authState.subscribe((user: User) => {
            if (user) {
                this.userData = user;
                this.setLocalUserData(this.userData);
                // JSON.parse(localStorage.getItem('user'));
            } else {
                //  this.setLocalUserData(null);
                // JSON.parse(localStorage.getItem('user'));
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

    // Sign in with Google
    async googleAuth(pendingCredential?): Promise<UserCredential> {
        try {
            let result: UserCredential;

            if (this.platform.is('cordova')) {
                const { accessToken } = await this.googlePlus.login({ offline: true });
                result = await this.ngFireAuth.auth.signInWithCredential(GoogleAuthProvider.credential(null, accessToken));
            } else {
                result = await this.ngFireAuth.auth.signInWithPopup(new GoogleAuthProvider());
            }

            await this.updateUserData(result, pendingCredential);

            return result;
        } catch (err) {
            if (err.code === 'auth/account-exists-with-different-credential') {
                await this.facebookAuth(err.credential);
            } else {
                console.error(err);
                alert('Something went wrong. Please try again later.');
            }
        }
    }

    async facebookAuth(pendingCredential?) {
        try {
            let result: UserCredential;

            if (this.platform.is('cordova')) {
                const res: FacebookLoginResponse = await this.facebook.login(['public_profile', 'email']);
                result = await this.ngFireAuth.auth.signInWithCredential(FacebookAuthProvider.credential(res.authResponse.accessToken));
            } else {
                result = await this.ngFireAuth.auth.signInWithPopup(new FacebookAuthProvider());
            }

            await this.updateUserData(result, pendingCredential);

            return result;
        } catch (err) {
            if (err.code === 'auth/account-exists-with-different-credential') {
                await this.googleAuth(err.credential);
            } else {
                console.error(err);
                alert('Something went wrong. Please try again later.');
            }
        }
    }

    public getUser(): Promise<AppUser> {
        let user = JSON.parse(localStorage.getItem('user'));
        if (!user || (user && !user.uid)) {
            user = this.ngFireAuth.user.toPromise().then(res => this.setLocalUserData(res));
        }
        return Promise.resolve(user);
    }

    // Sign-out
    public signOut() {
        return this.ngFireAuth.auth.signOut().then(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('isDarkMode');
            document.body.classList.toggle('dark', false);
            this.router.navigate(['login']);
        });
    }

    private async updateUserData(result: UserCredential, pendingCredential) {
        if (pendingCredential) {
            result = await result.user.linkWithCredential(pendingCredential);
        }

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
    }

    private createAppUser(user: User): AppUser {
      return {
            nickName: user.email.split('@')[0],
            userSettings: undefined,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
    }

    // Store user in localStorage
    private setUserData(user: User) {
        const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
        const userData: AppUser = {
            nickName: user.email.split('@')[0],
            userSettings: undefined,
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

    public saveUser(user: AppUser): Promise<AppUser> {
       // this.setLocalUserData(user);
        // todo
        // return this.setUserData(user);
        localStorage.setItem('user', JSON.stringify(user));
        return Promise.resolve(user);
    }

    private setLocalUserData(user: User): User {
        if (typeof user === 'string' || user instanceof String) {
            // @ts-ignore
            user = JSON.parse(user);
        }

        const userData: AppUser = {
            nickName: user.email.split('@')[0], userSettings: undefined,
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
