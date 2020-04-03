import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../shared/authentication-service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {

    constructor(
        public authService: AuthenticationService,
        public router: Router
    ) {
    }

    // logIn(email, password) {
    //     this.authService.SignIn(email.value, password.value)
    //         .then((res) => {
    //             if (this.authService.isEmailVerified) {
    //                 this.router.navigate(['tabs/tab1']);
    //             } else {
    //                 window.alert('Email is not verified');
    //                 return false;
    //             }
    //         }).catch((error) => {
    //         window.alert(error.message);
    //     });
    // }

    // Returns true when user is looged in
    get isLoggedIn(): boolean {
        return this.authService.isLoggedIn;
    }

    public logInGoogle() {
       return  this.authService.GoogleAuth();
    }
    public logInFacebook() {
       return  this.authService.FacebookAuth();
    }
}
