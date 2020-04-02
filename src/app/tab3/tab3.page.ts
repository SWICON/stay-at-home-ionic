import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { UserSettings } from '../model/user-settings.interface';
import {AuthenticationService} from '../shared/authentication-service';

const ACCES_TOKEN = 'pk.eyJ1IjoicGFua3k4MyIsImEiOiJjazhoaTkzNHMwMHZsM2VwY2RjZjlmcW56In0.ur3AjrMaGbuAV_rYIfCCXg';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  map: L.Map;
  center: L.PointTuple;
  isHomeRecorded = false;
  userSettings: UserSettings = {
    isolationStartedAt: null,
    homePosition: {
      latitude: null,
      longitude: null
    }
  };

  constructor(private platform: Platform,
              private geolocation: Geolocation,
              public authService: AuthenticationService) {
    this.platform.ready().then(() => {

      this.geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000
      })
        .then((position: Geoposition) => {
          this.center = [position.coords.latitude, position.coords.longitude];
          this.setMap();
        }).catch((error) => {
          console.log('Error getting location', error);
        });
    });
  }

  ngOnInit() {
    this.isHomeRecorded = false;
    this.userSettings.isolationStartedAt = moment().set({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0
    }).toISOString();

    this.saveUserSettings();
  }

  onHomeRecordedChanged(event) {
    const { value } = event.target;
    if (value) {
      this.userSettings.homePosition.latitude = this.center[0];
      this.userSettings.homePosition.longitude = this.center[1];
    } else {
      this.userSettings.homePosition.latitude = null;
      this.userSettings.homePosition.longitude = null;
    }

    this.saveUserSettings();
  }

  setMap() {
    setTimeout(() => {
      this.map = L.map('map').setView(this.center, 16);
      L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${ACCES_TOKEN}`, {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 256,
        accessToken: ACCES_TOKEN
      }).addTo(this.map);

      L.marker(this.center).addTo(this.map);
    }, 500); // Adjust the value (in ms)
  }

  saveUserSettings() {
    console.log('SAVE', this.userSettings);
  }
}
