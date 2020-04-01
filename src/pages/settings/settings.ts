import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as moment from 'moment';

export function getToday() {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today.toISOString();
}

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit {

  private _isolationBegin: string;

  homeIsCorrect: boolean;
  get isolationBegin(): string {
    return this._isolationBegin;
  }

  set isolationBegin(value: string) {
    this._isolationBegin = value;
    console.log(value);
  }

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
    this.homeIsCorrect = false;
    this.isolationBegin = moment().set({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0
    }).toISOString();
  }

  updateDate(event) {
    console.log(event);
  }
}
