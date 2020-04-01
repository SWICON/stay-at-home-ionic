import { Component } from '@angular/core';

import { SettingsPage } from '../settings/settings';
import { RankingPage } from '../ranking/ranking';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = RankingPage;
  tab3Root = SettingsPage;

  constructor() {

  }
}
