import {Injectable} from '@angular/core';
import * as moment from 'moment';

import {AppUser} from './appUser';
import {UserSettings} from './user-settings.interface';

@Injectable({
    providedIn: 'root'
})

export class UserSettingsService {

    userSettings: UserSettings;

    constructor() {

    }

    createUserSettings(user: AppUser): UserSettings {
        return this.userSettings = {
            userUid: null,
            isDarkMode: false,
            isfirstLogin: true,
            isolationStartedAt: moment().set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            }).format(),
            homePosition: {
                latitude: null,
                longitude: null,
                geohash: null
            }
        };
    }

    getUserSettings(user: AppUser): Promise<UserSettings> {

        let userSettings = JSON.parse(localStorage.getItem('user-settings'));

        if (!userSettings) {
            userSettings = this.createUserSettings(user);
        }

        return Promise.resolve(userSettings);
    }

    updateUserSettings(userSettings: UserSettings) {
        this.userSettings = userSettings;
        localStorage.setItem('user-settings', JSON.stringify(userSettings));
    }


}
