import { Component } from '@angular/core';
import {
    BackgroundGeolocation,
    BackgroundGeolocationConfig,
    BackgroundGeolocationEvents,
    BackgroundGeolocationResponse,
    BackgroundGeolocationLocationProvider,
    ServiceStatus
} from '@ionic-native/background-geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { BackgroundLocationService } from './shared/background-location.service';

const backgroundGeolocationConfig: BackgroundGeolocationConfig = {
    locationProvider: BackgroundGeolocationLocationProvider.DISTANCE_FILTER_PROVIDER,
    desiredAccuracy: 0,
    stationaryRadius: 200, // 200 meters
    distanceFilter: 200, // 200 meters
    stopOnTerminate: false,
    startOnBoot: true,
    startForeground: false,
    activitiesInterval: 1 * 60 * 1000 // 5 * 60 * 1000 // in millisec
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
        private backgroundLocationService: BackgroundLocationService) {

        // Use matchMedia to check the user preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        // Listen for changes to the prefers-color-scheme media query
        prefersDark.addListener((mediaQuery) => document.body.classList.toggle('dark', mediaQuery.matches));

        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            if (this.platform.is('cordova')) {
                this.backgroundGeolocation.configure(backgroundGeolocationConfig)
                    .then(() => {
                        this.backgroundGeolocation.on(BackgroundGeolocationEvents.location)
                            .subscribe(async (location: BackgroundGeolocationResponse) => {
                                await this.backgroundLocationService.onLocation(location);
                                this.backgroundGeolocation.finish();
                            });
                        this.backgroundGeolocation.on(BackgroundGeolocationEvents.stationary)
                            .subscribe(async (location: BackgroundGeolocationResponse) => {
                                await this.backgroundLocationService.onLocation(location);
                                this.backgroundGeolocation.finish();
                            });
                    });

                this.backgroundGeolocation.checkStatus().then((status: ServiceStatus) => {
                    console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
                    console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
                    console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

                    // you don't need to check status before start (this is just the example)
                    if (!status.isRunning) {
                        this.backgroundGeolocation.start(); //triggers start on start event
                    }
                });

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
