import { Component } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import L from 'leaflet';
import 'leaflet-routing-machine';
import geohash from 'ngeohash';
import { environment } from '../../environments/environment';
import { AppUser } from '../shared/appUser';
import { AuthenticationService } from '../shared/authentication-service';
import { SwipeService } from '../shared/swipe.service';

const ACCESS_TOKEN = environment.leaflet.accessToken;

@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

    isDarkMode: boolean;
    map: L.Map;
    center: L.PointTuple;
    appUser: AppUser;

    constructor(private platform: Platform,
        private swipe: SwipeService,
        private geolocation: Geolocation,
        private authenticationService: AuthenticationService) {

        this.platform.ready().then(async () => {

            try {
                this.appUser = await this.authenticationService.getUser();
                this._isHomeRecorded = !!(this.appUser.latitude && this.appUser.longitude);
                const position: Geoposition = await this.geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 30000
                });
                this.center = [position.coords.latitude, position.coords.longitude];
                this.setMap();
            } catch (err) {
                console.log('Error UserSettings initialization', err);
            }
        });

        //  this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode') || 'false');
    }

    private _isHomeRecorded = false;

    get isHomeRecorded(): boolean {
        return this._isHomeRecorded;
    }

    get isolationStartedAt(): string {
        return this.appUser ? this.appUser.isolationStartedAt : null;
    }

    set isolationStartedAt(value: string) {
        this.appUser.isolationStartedAt = value;
        this.updateUserSettings();
    }

    onHomeRecordedChanged(event) {
        if (event.detail.checked) {
            this.appUser.latitude = this.center[0];
            this.appUser.longitude = this.center[1];
            this.appUser.geohash = geohash.encode(this.appUser.latitude, this.appUser.longitude);
        } else {
            this.appUser.latitude = null;
            this.appUser.longitude = null;
            this.appUser.geohash = null;
        }
        this.updateUserSettings();
    }

    toggleDarkTheme() {
        this.updateUserSettings();
        document.body.classList.toggle('dark', this.appUser.isDarkMode);
    }

    signOut() {
        this.authenticationService.signOut();
    }

    onSwipe(event) {
        if (event.deltaX > 0) {
            this.swipe.toRight('tabs/rank');
        } else {
            // nothing
        }
    }

    private setMap() {
        setTimeout(() => {
            this.map = L.map('map').setView(this.center, 16);
            L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`, {
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 256,
                accessToken: ACCESS_TOKEN
            }).addTo(this.map);
            L.marker(this.center).addTo(this.map);
        }, 400);
    }

    private updateUserSettings() {
        this.authenticationService.saveUser(this.appUser);
    }
}
