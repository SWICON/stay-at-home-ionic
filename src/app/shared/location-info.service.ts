import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import geohash from 'ngeohash';
import {AppUser} from './app-user';
import {AreaInfo} from './area-info';
import {Position} from './position';

const getGeohashRange = (
    latitude: number,
    longitude: number,
    distanceKm: number, // km
) => {
    const lat = 0.0144927536231884; // degrees latitude per mile
    const lon = 0.0181818181818182; // degrees longitude per mile

    const distance = 0.621371192 * distanceKm; // mile
    const lowerLat = latitude - lat * distance;
    const lowerLon = longitude - lon * distance;

    const upperLat = latitude + lat * distance;
    const upperLon = longitude + lon * distance;

    const lower = geohash.encode(lowerLat, lowerLon);
    const upper = geohash.encode(upperLat, upperLon);

    return {
        lower,
        upper
    };
};

@Injectable({
    providedIn: 'root'
})
export class LocationInfoService {

    constructor(public afStore: AngularFirestore) {
    }

    public getAreaInfo(position: Position): AreaInfo {
        const range10 = getGeohashRange(position.latitude, position.latitude, 10);
        const range20 = getGeohashRange(position.latitude, position.latitude, 20);
        const range100 = getGeohashRange(position.latitude, position.latitude, 100);

        const km10 = 63;
        const km20 = 601;
        const km100 = 12312;
        // this.afStore.collection<AppUser>('users', ref => {
        //     return ref
        //         .where('geohash', '>=', range10.lower)
        //         .where('geohash', '<=', range10.upper);
        // }).get()
        //     .toPromise()
        //     .then((result) => {
        //         km10 = result.docs.length;    // return the count
        //     });
        //
        // this.afStore
        //     .collection<AppUser>('users', ref => {
        //         return ref
        //             .where('geohash', '>=', range20.lower)
        //             .where('geohash', '<=', range20.upper);
        //     })
        //     .get()
        //     .toPromise()
        //     .then((result) => {
        //         km20 = result.docs.length;    // return the count
        //     });

        return {km10, km20, km100};
    }
}
