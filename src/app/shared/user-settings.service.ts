import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { auth } from 'firebase';
import * as moment from 'moment';

import { User } from './user';
import { UserSettings } from './user-settings.interface';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserSettingsService {

  userSettings: UserSettings;

  constructor() {

  }

  createUserSettings(user: User): UserSettings {
    return this.userSettings = {
      userUid: null,
      isolationStartedAt: moment().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      }).format(),
      homePosition: {
        latitude: null,
        longitude: null
      }
    };
  }

  getUserSettings(user: User): Promise<UserSettings> {

    // TODO if any return user settings
    // else create new one
    const userSettings = this.createUserSettings(user);

    return Promise.resolve(userSettings);
  }

  updateUserSettings(userSettings: UserSettings) {
    console.log('SAVE', userSettings);
  }
}