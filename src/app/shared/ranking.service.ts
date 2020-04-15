import {Injectable} from '@angular/core';

import {AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot} from '@angular/fire/firestore';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {AppUser} from './app-user';


@Injectable({
    providedIn: 'root'
})
export class RankingService {

    private itemsSubject: BehaviorSubject<AppUser[] | undefined> =
        new BehaviorSubject(undefined);
    private lastPageReached: BehaviorSubject<boolean> =
        new BehaviorSubject(false);

    private nextQueryAfter: QueryDocumentSnapshot<AppUser>;

    private paginationSub: Subscription;
    private findSub: Subscription;

    constructor(private fireStore: AngularFirestore) {
    }

    destroy() {
        this.unsubscribe();
    }

    watchItems(): Observable<AppUser[]> {
        return this.itemsSubject.asObservable();
    }

    watchLastPageReached(): Observable<boolean> {
        return this.lastPageReached.asObservable();
    }

    find() {
        try {
            const collection: AngularFirestoreCollection<AppUser> =
                this.getCollectionQuery();

            this.unsubscribe();

            this.paginationSub = collection.get()
                .subscribe(async (first) => {
                    this.nextQueryAfter = first.docs[first.docs.length - 1] as
                        QueryDocumentSnapshot<AppUser>;

                    await this.query(collection);
                });
        } catch (err) {
            throw err;
        }
    }

    private unsubscribe() {
        if (this.paginationSub) {
            this.paginationSub.unsubscribe();
        }

        if (this.findSub) {
            this.findSub.unsubscribe();
        }
    }

    private getCollectionQuery(): AngularFirestoreCollection<AppUser> {
        if (this.nextQueryAfter) {
            return this.fireStore.collection<AppUser>('/users2/', ref =>
                ref.orderBy('isolationStartedAt', 'desc')
                    .startAfter(this.nextQueryAfter)
                    .limit(10));
        } else {
            return this.fireStore.collection<AppUser>('/users2/', ref =>
                ref.orderBy('isolationStartedAt', 'desc')
                    .limit(10));
        }
    }

    private query(collection: AngularFirestoreCollection<AppUser>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.findSub = collection.snapshotChanges().pipe(
                    map(actions => {
                        return actions.map(a => {
                            const data: AppUser = a.payload.doc.data() as AppUser;
                            return data;
                        });
                    })
                ).subscribe(async (items) => {
                    return await this.addItems(items);
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    private addItems(items: AppUser[]): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!items || items.length <= 0) {
                this.lastPageReached.next(true);

                resolve();
                return;
            }
            this.itemsSubject.asObservable().pipe(take(1))
                .subscribe((currentItems: AppUser[]) => {
                    this.itemsSubject.next(currentItems !== undefined ?
                        [...currentItems, ...items] : [...items]);

                    resolve();
                });
        });
    }
}
