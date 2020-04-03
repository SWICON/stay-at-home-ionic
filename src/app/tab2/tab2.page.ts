import { Component } from '@angular/core';
import { LocationService } from '../shared/location.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  entries$: Observable<string[]>;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.entries$ = this.locationService.entries$;
  }
}
