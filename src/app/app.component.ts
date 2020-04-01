import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase/app';

import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    firebase.initializeApp({
      apiKey: 'AIzaSyBxLqlT6KgQWSSxYlXijZcHKwcjJj76XSE',
      authDomain: 'stay-at-home-ionic.firebaseapp.com',
      databaseURL: 'https://stay-at-home-ionic.firebaseio.com',
      projectId: 'stay-at-home-ionic',
      storageBucket: 'stay-at-home-ionic.appspot.com',
      messagingSenderId: '159351352235'
    });
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
