import { Component, OnInit } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AppUser } from '../shared/appUser';
import { AreaInfo } from '../shared/area-info';
import { AuthenticationService } from '../shared/authentication-service';
import { LocationInfoService } from '../shared/location-info.service';
import { UserPoint } from '../shared/user-point';
import { SwipeService } from '../shared/swipe.service';

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
    points: UserPoint;

    localArea: AreaInfo;

    constructor(private platform: Platform,
        private swipe: SwipeService,
        private toaster: ToastController,
        private location: LocationInfoService,
        private auth: AuthenticationService) {

    }


    ngOnInit(): void {
        this.platform.ready().then(async () => {
            this.user = await this.auth.getUser().then(user => {
                this.daysInIsolation = daysBetween(new Date(user.isolationStartedAt), new Date());
                this.localArea = this.location.getAreaInfo({ longitude: user.longitude, latitude: user.latitude, geohash: user.geohash });
                return user;
            });
        });

        this.auth.getUserPoints().then(res => this.points = res);

    }

    onSwipe(event) {
        if (event.deltaX > 0) {
            // nothing
        } else {
            this.swipe.toLeft('tabs/rank');
        }
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
