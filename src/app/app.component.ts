import {Component} from '@angular/core';
import {LocationAccuracy} from '@ionic-native/location-accuracy/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {Platform} from '@ionic/angular';

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
        private locationAccuracy: LocationAccuracy) {
        // Use matchMedia to check the user preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        if (JSON.parse(localStorage.getItem('isDarkMode') || 'false')) {
            toggleDarkTheme(true);
        }
        // Listen for changes to the prefers-color-scheme media query
        prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches));

        // Add or remove the "dark" class based on if the media query matches
        function toggleDarkTheme(shouldAdd) {
            document.body.classList.toggle('dark', shouldAdd);
        }

        this.initializeApp();
    }

    initializeApp() {
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
