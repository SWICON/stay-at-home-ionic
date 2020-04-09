import {Component, OnInit} from '@angular/core';
import {Platform, ToastController} from '@ionic/angular';
import {AppUser} from '../shared/appUser';
import {AuthenticationService} from '../shared/authentication-service';

const oneDay = 1000 * 60 * 60 * 24;

function daysBetween(one, another) {
    return Math.round(Math.abs((+one) - (+another)) / oneDay);
}

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
    user: AppUser;
    daysInIsolation: number;
    nickNameEdit = false;

    points = {
        collected: 15,
        reward: 18,
        penalty: 3
    };

    localArea: any = {
        km10: 1534,
        km20: 23023,
        km100: 523420
    };

    constructor(private platform: Platform,
                private toaster: ToastController,
                private auth: AuthenticationService) {

        this.platform.ready().then(async () => {
            this.user = await this.auth.getUser().then(user => {
                this.daysInIsolation = daysBetween(new Date(user.isolationStartedAt), new Date());
                return user;
            });
        });

    }


    ngOnInit(): void {
    }

    setEditableNick() {
        this.nickNameEdit = true;
    }

    async saveNick() {
        // this.nickNameEdit = true;
        console.log(this.user.nickName);
        this.user = await this.auth.saveUser(this.user);
        this.nickNameEdit = false;
    }


}
