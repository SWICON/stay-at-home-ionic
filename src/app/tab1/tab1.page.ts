import { Component } from '@angular/core';
// import * as firebase from 'firebase';
// import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  isUserLoggedIn: any = false;
  userData: any = {};

  constructor(private platform: Platform,
              private toaster: ToastController,
              // private googleplus: GooglePlus
  ) {
    // firebase.auth().onAuthStateChanged(authData => {
    //   if (authData != null) {
    //     this.isUserLoggedIn = true;
    //     this.userData = authData;
    //     console.log(authData);
    //   } else {
    //     this.userData = {};
    //   }
    // });
  }

  // logout() {
  //   firebase.auth().signOut();
  //   this.isUserLoggedIn = false;
  // }

  displayToast(message) {
    this.toaster.create({ message, duration: 3000 });
  }

  // doGoogleLogin() {
  //   // browser login
  //   if (this.platform.is('desktop')) {
  //     firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(gpRes => {
  //       this.displayToast('Login Success');
  //       this.userData = gpRes.additionalUserInfo.profile;
  //     }).catch(err => this.displayToast(err));
  //   } else {
  //     this.googleplus.login({
  //       webClientId: '...'
  //     }).then((success) => {
  //       console.log(success);
  //       const credential = firebase.auth.GoogleAuthProvider.credential(success.idToken, null);
  //       firebase.auth().signInWithCredential(credential).then((data) => {
  //         console.log(data);
  //       }).catch((err) => this.displayToast(err));
  //     }, err => this.displayToast(err));
  //   }
  // }
}
