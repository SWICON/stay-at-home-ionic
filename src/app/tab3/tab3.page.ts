import { Component } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { UserSettings } from '../shared/user-settings.interface';
import { AuthenticationService } from '../shared/authentication-service';
import { UserSettingsService } from '../shared/user-settings.service';
import { environment } from '../../environments/environment';

const ACCES_TOKEN = environment.leaflet.accessToken;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  private _isHomeRecorded: boolean = false;
  isDarkMode: boolean;
  map: L.Map;
  center: L.PointTuple;
  userSettings: UserSettings;

  get isHomeRecorded(): boolean {
    return this._isHomeRecorded;
  }

  get isolationStartedAt(): string {
    return this.userSettings ? this.userSettings.isolationStartedAt : null;
  }

  set isolationStartedAt(value: string) {
    this.userSettings.isolationStartedAt = value;
  }

  constructor(private platform: Platform,
    private geolocation: Geolocation,
    private authenticationService: AuthenticationService,
    private userSettingsService: UserSettingsService) {

    this.platform.ready().then(async () => {

      try {
        this.userSettings = await this.userSettingsService.getUserSettings(this.authenticationService.userData);
        this._isHomeRecorded = !!(this.userSettings.homePosition.latitude && this.userSettings.homePosition.longitude);
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

    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode') || 'false');
  }

  setMap() {
    setTimeout(() => {
      this.map = L.map('map').setView(this.center, 16);
      L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`, {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 256,
        accessToken: ACCES_TOKEN
      }).addTo(this.map);
    }
  }

  toggleDakTheme() {
    localStorage.setItem('isDarkMode', JSON.stringify(this.isDarkMode));
    document.body.classList.toggle('dark', this.isDarkMode);
  }


  saveUserSettings() {
    console.log('SAVE', this.userSettings);
  }

  signOut() {
    this.authenticationService.SignOut();
  }
}
