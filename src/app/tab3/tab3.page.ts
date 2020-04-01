import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';

declare var ol: any;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  private _isolationBegin: string;
  private _currentPosition: Geoposition;

  map: any;

  homeIsCorrect: boolean;
  get isolationBegin(): string {
    return this._isolationBegin;
  }

  set isolationBegin(value: string) {
    this._isolationBegin = value;
  }

  constructor(private platform: Platform,
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
  }
}
