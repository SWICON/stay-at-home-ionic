import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Position } from './position';

export const deg2Rad = (deg) => deg * (Math.PI / 180);

@Injectable({
    providedIn: 'root'
})

export class LocationService {

    private _interval;
    private _entries: BehaviorSubject<string[]> = new BehaviorSubject([]);
    entries$: Observable<string[]> = this._entries.asObservable();

    constructor() {
        this._interval = setInterval(() => {
            this._entries.next(this.load());
        }, 2000);
    }

    prepend(message) {
        const current = this.load();
        current.unshift(message);
        this.save(current);
    }

    load() {
        return JSON.parse(localStorage.getItem('location-entries') || '[]');
    }

    save(entries) {
        localStorage.setItem('location-entries', JSON.stringify(entries));
    }

    destroy() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

    calcDistanceInKm(coord1: Position, coord2: Position) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2Rad(coord2.latitude - coord1.latitude);  // deg2rad below
        let dLon = deg2Rad(coord2.longitude - coord2.longitude);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2Rad(coord1.latitude)) * Math.cos(deg2Rad(coord2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }
}
