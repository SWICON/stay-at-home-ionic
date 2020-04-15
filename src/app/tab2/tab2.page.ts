import { Component } from '@angular/core';
import { SwipeService } from '../shared/swipe.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private swipe: SwipeService) { }

  ngOnInit() {

  }

  onSwipe(event) {
    if (event.deltaX > 0) {
      this.swipe.toRight('tabs/home');
    } else {
      this.swipe.toLeft('tabs/settings');
    }
  }
}
