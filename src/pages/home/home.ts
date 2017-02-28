import {Component} from '@angular/core';

//Transition
import {trigger, state, style, transition, animate} from '@angular/core';

import {NavController} from 'ionic-angular';

import {PhotoPage} from '../photo/photo';
import {ConnectPage} from '../connect/connect';
import {testSocket} from '../testSocket/testSocket';
import {AboutPage} from '../about/about';
import {StorageService} from '../util/storage.service';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    animations: [
        trigger('flip', [
            state('flipped', style({
                transform: 'rotateY(-180deg)'
            })),
            transition('* => flipped', animate('1600ms ease'))
        ])
    ]
})

export class HomePage {
    photoPage = PhotoPage;
    flipState: String = 'notFlipped';
    private token: string;

    constructor(public navCtrl: NavController,
    private storageService: StorageService) {}

    getPaddingTop() {
        return (window.innerHeight / 100) * 25;
    }

    toPictures() {
        setTimeout(() => {
            //this.navCtrl.push(this.photoPage);
            this.navCtrl.push(this.photoPage, null, {animation: 'fade-transition', direction: 'forward'});
            setTimeout(() => {
                this.flipState = 'notFlipped';
            }, 800);
        }, 850);
        this.flipState = 'flipped';
    }
    
    connect(){
        this.navCtrl.push(ConnectPage);
    }
    
    socket(){
        this.navCtrl.push(testSocket);
    }
    
    request(){
        this.navCtrl.push(AboutPage);
    }
    
    ionWillEnter(){
        console.log(this.storageService.getToken());
    }
}