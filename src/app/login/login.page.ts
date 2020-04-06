import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication-service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {

    constructor(
        public authService: AuthenticationService,
        public router: Router
    ) { }

    // Returns true when user is looged in
    get isLoggedIn(): boolean {
        return this.authService.isLoggedIn;
    }

    public logInGoogle() {
        return this.authService.googleAuth();
    }
    public logInFacebook() {
        return this.authService.facebookAuth();
    }
}
