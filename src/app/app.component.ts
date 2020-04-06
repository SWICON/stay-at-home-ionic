import { Component } from '@angular/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';
import { Platform } from '@ionic/angular';
import * as moment from 'moment';
import { LocationService } from './shared/location.service';
import { UserSettingsService } from './shared/user-settings.service';

const backgroundGeolocationConfig: BackgroundGeolocationConfig = {
    desiredAccuracy: 10,
    stationaryRadius: 20,
    distanceFilter: 30,
    debug: true,
    stopOnTerminate: false
}

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
        this.platform.ready().then(() => {
            console.log('platform is ready');
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.backgroundGeolocation.configure(backgroundGeolocationConfig)
                .then(() => {
                    this.backgroundGeolocation.on(BackgroundGeolocationEvents.location)
                        .subscribe(async (location: BackgroundGeolocationResponse) => {
                            const { homePosition } = await this.userSettingsService.getUserSettings(null);

                            if (!!(homePosition.latitude && homePosition.longitude)) {
                                const now = moment(location.time).format();
                                const distance = this.locationService.calcDistanceInKm(homePosition, {
                                    latitude: location.latitude,
                                    longitude: location.longitude
                                });

                                this.locationService.prepend(`${now} - ${distance}km (${location.latitude};${location.longitude})`);
                            }

                            this.backgroundGeolocation.finish();
                        });

                });

            this.backgroundGeolocation.start();

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
