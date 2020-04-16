import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AppUser } from '../shared/app-user';
import { AreaInfo } from '../shared/area-info';
import { AuthenticationService } from '../shared/authentication-service';
import { LocationInfoService } from '../shared/location-info.service';
import { SwipeService } from '../shared/swipe.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
    localArea: AreaInfo;

    constructor(private platform: Platform,
        private swipe: SwipeService,
        private toaster: ToastController,
        private location: LocationInfoService,
        private auth: AuthenticationService) {

    }

    ngOnInit(): void {
        this.auth.subscribeUser$().subscribe((appUser) => {
            this.daysInIsolation = daysBetween(new Date(appUser.isolationStartedAt), new Date());
            this.localArea = this.location.getAreaInfo({ longitude: appUser.longitude, latitude: appUser.latitude, geohash: appUser.geohash });
            this.user = appUser;
        });
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
        this.user = await this.auth.saveUser(this.user);
        this.nickNameEdit = false;
    }
}
