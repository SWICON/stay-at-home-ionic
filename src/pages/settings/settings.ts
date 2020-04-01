import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as moment from 'moment';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

declare var ol: any;

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit {

  private _isolationBegin: string;
  private _currentPosition: Geoposition;

  map: any;

  homeIsCorrect: boolean;
  get isolationBegin(): string {
    return this._isolationBegin;
  }

  set isolationBegin(value: string) {
    this._isolationBegin = value;
    console.log(value);
  }

  constructor(public navCtrl: NavController,
    private geolocation: Geolocation) { }

  ngOnInit() {
    this.homeIsCorrect = false;
    this.isolationBegin = moment().set({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0
    }).toISOString();

    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ]
    });

    this.geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000
    })
    .then((position: Geoposition) => {
      console.log(position);
      this._currentPosition = position;
      this.setMapCenter(position.coords.longitude, position.coords.latitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  setMapCenter(longitude, latitude) {
    const view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([longitude, latitude]));
    view.setZoom(8);
    console.log(this._currentPosition);
  }
}
