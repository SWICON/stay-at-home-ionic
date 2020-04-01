import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import * as firebase from 'firebase/app';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

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
    private locationAccuracy: LocationAccuracy
  ) {
    this.initializeApp();
  }

  initializeApp() {
    firebase.initializeApp({
      apiKey: 'AIzaSyBxLqlT6KgQWSSxYlXijZcHKwcjJj76XSE',
      authDomain: 'stay-at-home-ionic.firebaseapp.com',
      databaseURL: 'https://stay-at-home-ionic.firebaseio.com',
      projectId: 'stay-at-home-ionic',
      storageBucket: 'stay-at-home-ionic.appspot.com',
      messagingSenderId: '159351352235'
    });
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
