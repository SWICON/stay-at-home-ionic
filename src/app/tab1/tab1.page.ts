import {Component, OnInit} from '@angular/core';
import {Platform, ToastController} from '@ionic/angular';
import {AuthenticationService} from '../shared/authentication-service';
import {AppUser} from '../shared/appUser';
import {UserSettings} from '../shared/user-settings.interface';
import {UserSettingsService} from '../shared/user-settings.service';

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
    isUserLoggedIn: any = false;
    userSettings: UserSettings;
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
                private userService: UserSettingsService,
                private auth: AuthenticationService) {

        this.platform.ready().then(async () => {
            this.user = await this.auth.getUser();
            this.userSettings = await this.userService.getUserSettings(this.user)
                .then((res: UserSettings) => {
                    this.daysInIsolation = daysBetween(new Date(res.isolationStartedAt), new Date());
                    return res;
                });
        });

    }


    ngOnInit(): void {
    }

    setEditableNick() {
       this.nickNameEdit = true;
    }


}
