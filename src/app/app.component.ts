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
import * as Hammer from 'hammerjs';

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

    private hammer: any;

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

        this.hammer = new Hammer(document.body);
        this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

        this.platform.ready().then(async () => {

            if (this.platform.is('cordova')) {
                this.statusBar.styleDefault();
                this.splashScreen.hide();

                const canRequestLocationAccuracy = await this.locationAccuracy.canRequest();

                if (canRequestLocationAccuracy) {
                    try {
                        await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
                        await this.backgroundGeolocation.configure(backgroundGeolocationConfig);

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

                        const bgLocStatus: ServiceStatus = await this.backgroundGeolocation.checkStatus();
                        console.log('[INFO] BackgroundGeolocation service is running', bgLocStatus.isRunning);
                        console.log('[INFO] BackgroundGeolocation services enabled', bgLocStatus.locationServicesEnabled);
                        console.log('[INFO] BackgroundGeolocation auth status: ' + bgLocStatus.authorization);
                        if (!bgLocStatus.isRunning) {
                            this.backgroundGeolocation.start();
                        }
                    } catch (err) {
                        console.error('[ERROR] BackgroundGeolocation stopped.');
                        this.backgroundGeolocation.stop();
                    }
                }
            }
        });
    }
}
