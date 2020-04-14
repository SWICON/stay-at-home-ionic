import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {Facebook, FacebookLoginResponse} from '@ionic-native/facebook/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Platform} from '@ionic/angular';
import {auth, User} from 'firebase';
import {AppUser} from './appUser';
import {UserPoint} from './user-point';
import FacebookAuthProvider = auth.FacebookAuthProvider;
import GoogleAuthProvider = auth.GoogleAuthProvider;
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
                // this.setLocalUserData(this.userData);
                // JSON.parse(localStorage.getItem('user'));
            } else {
                //  this.setLocalUserData(null);
                // JSON.parse(localStorage.getItem('user'));
            }
        });
    }

    // Returns true when user is looged in
    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
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
                const {accessToken} = await this.googlePlus.login({offline: true});
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
            user = this.ngFireAuth.user.toPromise().then(res => {
                return this.createOrGetAppUser(res).then(created => this.setLocalUserData(created)
                );
            });
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

    public async saveUser(user: AppUser): Promise<AppUser> {
        // this.setLocalUserData(user);
        // todo
        // return this.updateAppUser(user);
        this.updateAppUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return Promise.resolve(user);
    }

    public async getUserPoints(): Promise<UserPoint> {
        const user = await this.getUser();
        const points = await this.getPointFromServer(user.uid);
        return Promise.resolve(points);
    }

    private async updateUserData(result: UserCredential, pendingCredential) {
        if (pendingCredential) {
            result = await result.user.linkWithCredential(pendingCredential);
        }

        const appUser = await this.createOrGetAppUser(result.user);

        if (appUser.isfirstLogin) {
            appUser.isfirstLogin = false;
            this.updateAppUser(appUser);
            this.ngZone.run(() => {
                this.router.navigate(['/tabs/settings']);
            });
        } else {
            this.ngZone.run(() => {
                this.router.navigate(['/tabs']);
            });
        }
        return this.setLocalUserData(appUser);


    }

    private async createOrGetAppUser(user: User): Promise<AppUser> {
        return this.afStore.collection(`users`)
            .doc(user.uid).get().toPromise().then(doc => {
                let appUser;
                if (!doc.exists) {
                    console.log('No such document!');
                    appUser = {
                        geohash: null,
                        isDarkMode: false,
                        isfirstLogin: true,
                        isolationStartedAt: null,
                        latitude: 0,
                        longitude: 0,
                        nickName: user.email.split('@')[0],
                        uid: user.uid,
                        email: user.email,
                        locale: 'en'
                    };
                    this.afStore.collection('users').doc(appUser.uid).set(appUser);
                } else {
                    console.log('Document data:', doc.data());

                    appUser = doc.data();
                }
                return Promise.resolve(appUser);
            }).catch(err => {
                console.log('Error getting document', err);
            });
    }

    private updateAppUser(user: AppUser) {
        const userRef: AngularFirestoreDocument<AppUser> = this.afStore.doc(`users/${user.uid}`);
        return userRef.set(user, {
            merge: true
        });

    }

    private setLocalUserData(user: AppUser): AppUser {
        if (typeof user === 'string' || user instanceof String) {
            // @ts-ignore
            user = JSON.parse(user);
        }

        // const userData: AppUser = this.createOrGetAppUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }

    private async getPointFromServer(uid: string): Promise<UserPoint> {
        return this.afStore.collection(`points`)
            .doc(uid).get().toPromise().then(doc => {
                let points;
                if (!doc.exists) {
                    console.log('No such document!');
                    points = ({
                        uid,
                        collected: 0,
                        reward: 0,
                        penalty: 0,
                    });
                    this.afStore.collection('points').doc(uid).set(points);
                } else {
                    console.log('Document data:', doc.data());

                    points = doc.data();
                }
                return Promise.resolve(points);
            }).catch(err => {
                console.log('Error getting document', err);
            });
    }

}
