import {Component} from '@angular/core';

//Transition
import {trigger, state, style, transition, animate, keyframes} from '@angular/core';

import {NavController} from 'ionic-angular';

import {PhotoPage} from '../photo/photo';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    animations: [
        trigger('flip', [
            state('flipped', style({
                transform: 'rotateY(-180deg)'
            })),
            transition('* => flipped', animate('3000ms ease'))
        ])
    ]
})

export class HomePage {
    photoPage = PhotoPage;
    flipState: String = 'notFlipped';

    constructor(public navCtrl: NavController) {}

    getPaddingTop() {
        return (window.innerHeight / 100) * 25;
    }

    toPictures() {
        //this.flipState = (this.flipState == 'notFlipped') ? 'flipped' : 'notFlipped';
        setTimeout(() => {
            //this.navCtrl.push(this.photoPage);
            this.navCtrl.push(this.photoPage, null, {animation: 'fade-transition', direction: 'forward'});
            setTimeout(() => {
                this.flipState = 'notFlipped';
            }, 800);
        }, 500);
        this.flipState = 'flipped';
        //this.navCtrl.push(this.photoPage, null, {animation: 'fade-transition', direction: 'forward'});
    }
}