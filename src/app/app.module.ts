import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {LocationAccuracy} from '@ionic-native/location-accuracy/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthenticationService} from './shared/authentication-service';


@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        AngularFireDatabaseModule,
        AngularFirestoreModule],
    providers: [
        StatusBar,
        SplashScreen,
        GooglePlus,
        Geolocation,
        LocationAccuracy,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        AuthenticationService,
        AngularFirestoreModule,
        AngularFireAuthGuard,
        AngularFireAuth],
    bootstrap: [AppComponent]
})
export class AppModule {
}
