import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NativePageTransitions } from '@ionic-native/native-page-transitions/ngx';

const slideConfig = (direction) => {
    return {
        direction,
        duration: 200,
        slowdownfactor: -5,
        iosdelay: 50
    };
}

@Injectable({
    providedIn: 'root'
})
export class SwipeService {

    constructor(private nav: NavController, private transition: NativePageTransitions) { }

    toLeft(url) {
        this.transition.slide(slideConfig('left'));
        this.nav.navigateRoot(url);
    }

    toRight(url) {

        this.transition.slide(slideConfig('right'));
        this.nav.navigateRoot(url);
    }
}