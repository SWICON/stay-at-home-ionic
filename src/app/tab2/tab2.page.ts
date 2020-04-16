import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { SwipeService } from '../shared/swipe.service';

import { Observable, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AppUser } from '../shared/app-user';
import { RankingService } from '../shared/ranking.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {

  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;

  items$: Observable<AppUser[]>;

  loaded = false;

  private lastPageReachedSub: Subscription;

  constructor(private swipe: SwipeService,
    private ranking: RankingService) {
  }

  async ngOnInit() {
    this.items$ = this.ranking.watchItems();

    this.lastPageReachedSub =
      this.ranking.watchLastPageReached()
        .subscribe((reached: boolean) => {
          if (reached && this.infiniteScroll) {
            this.loaded = true;
            this.infiniteScroll.disabled = true;
          }
        });

    this.ranking.watchItems().pipe(
      filter(flats => flats !== undefined),
      take(1)).subscribe((_items: AppUser[]) => {
        this.loaded = true;
      });

  }

  ngOnDestroy() {
    if (this.lastPageReachedSub) {
      this.lastPageReachedSub.unsubscribe();
    }
  }
  async findNext($event) {
    setTimeout(async () => {
      await this.ranking.find();
      $event.target.complete();
    }, 500);
  }

  onSwipe(event) {
    if (event.deltaX > 0) {
      this.swipe.toRight('tabs/home');
    } else {
      this.swipe.toLeft('tabs/settings');
    }
  }
}
