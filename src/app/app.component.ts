import {Component} from '@angular/core';
import {
    BackgroundGeolocation,
    BackgroundGeolocationConfig,
    BackgroundGeolocationEvents,
    BackgroundGeolocationResponse
} from '@ionic-native/background-geolocation/ngx';
import {LocationAccuracy} from '@ionic-native/location-accuracy/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Platform} from '@ionic/angular';
import * as moment from 'moment';
import geohash from 'ngeohash';
import {LocationService} from './shared/location.service';
import {UserSettingsService} from './shared/user-settings.service';

const backgroundGeolocationConfig: BackgroundGeolocationConfig = {
    desiredAccuracy: 10,
    stationaryRadius: 20,
    distanceFilter: 30,
    debug: true,
    stopOnTerminate: false
};

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private locationAccuracy: LocationAccuracy,
        private backgroundGeolocation: BackgroundGeolocation,
        private userSettingsService: UserSettingsService,
        private locationService: LocationService) {

        // Use matchMedia to check the user preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        if (JSON.parse(localStorage.getItem('isDarkMode') || 'false')) {
            document.body.classList.toggle('dark', true);
        }
        // Listen for changes to the prefers-color-scheme media query
        prefersDark.addListener((mediaQuery) => document.body.classList.toggle('dark', mediaQuery.matches));

        this.initializeApp();
    }

    initializeApp() {
        this.backgroundGeolocation.configure(backgroundGeolocationConfig)
            .then(() => {
                this.backgroundGeolocation.on(BackgroundGeolocationEvents.location)
                    .subscribe(async (location: BackgroundGeolocationResponse) => {
                        const {homePosition} = await this.userSettingsService.getUserSettings(null);
                        if (!homePosition.geohash || homePosition.geohash === '') {
                            homePosition.geohash = geohash.encode(homePosition.latitude, homePosition.latitude);
                        }

                        if (!!(homePosition.latitude && homePosition.longitude)) {
                            const now = moment(location.time).format();
                            const distance = this.locationService.calcDistanceInKm(homePosition, {
                                geohash: geohash.encode(location.latitude, location.latitude),
                                latitude: location.latitude,
                                longitude: location.longitude
                            });

                            this.locationService.prepend(`${now} - ${distance}km (${location.latitude};${location.longitude})`);
                        }

                        this.backgroundGeolocation.finish();
                    });

            });

        this.backgroundGeolocation.start();

        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            if (!this.platform.is('desktop')) {
                this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                    if (canRequest) {
                        // the accuracy option will be ignored by iOS
                        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                            () => console.log('Request successful'),
                            error => console.log('Error requesting location permissions', error)
                        );
                    }
                });
            }
        });
    }
}
