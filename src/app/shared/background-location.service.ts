import { Injectable } from '@angular/core';
import { BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';
import * as moment from 'moment';
import { Position } from './position';
import { AuthenticationService } from './authentication-service';

export const deg2Rad = (deg) => deg * (Math.PI / 180);

@Injectable({
    providedIn: 'root'
})
export class BackgroundLocationService {

    constructor(private authenticationService: AuthenticationService) { }

    async onLocation(location: BackgroundGeolocationResponse) {
        console.log('[INFO] BackgroundGeolocation service location received', location);
        const appUser = await this.authenticationService.getUser();

        if (appUser.latitude && appUser.longitude) {
            const now = moment(location.time).format('MM.DD. HH:mm');

            const distance = this.calcDistanceInKm({
                latitude: appUser.latitude,
                longitude: appUser.longitude
            }, {
                latitude: location.latitude,
                longitude: location.longitude
            });

            console.log(`[INFO] ${now} | distance: ${distance}km`);
            if (distance > 0.2) {
                console.log('[INFO] You are far away.');
            } else {
                console.log('[INFO] You are home, you are safe.');
            }
        }
    }

    onError(err) {
        console.error('[ERROR] BackgroundGeolocation error:', err);
    }

    calcDistanceInKm(coord1: Position, coord2: Position) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2Rad(coord2.latitude - coord1.latitude);  // deg2rad below
        const dLon = deg2Rad(coord2.longitude - coord2.longitude);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2Rad(coord1.latitude)) * Math.cos(deg2Rad(coord2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return Number(d.toFixed(5));
    }
}