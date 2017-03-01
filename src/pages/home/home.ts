import {Component} from '@angular/core';

//Transition
import {trigger, state, style, transition, animate} from '@angular/core';

import {NavController} from 'ionic-angular';

import {AlbumPage} from '../album/album';
import {ConnectPage} from '../connect/connect';
import {testSocket} from '../testSocket/testSocket';
import {AboutPage} from '../about/about';
import {StorageService} from '../util/storage.service';
import {User} from '../util/user';

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
    ],
    providers: [ConnectPage]
})

export class HomePage {
    albumPage = AlbumPage;
    connectPage = ConnectPage;
    flipState: String = 'notFlipped';

    constructor(public navCtrl: NavController,
        private storageService: StorageService,
        private user: User) {}

    getPaddingTop() {
        return (window.innerHeight / 100) * 25;
    }

    toPictures() {
        setTimeout(() => {
            this.navCtrl.push(this.albumPage, null, {animation: 'fade-transition', direction: 'forward'});
            setTimeout(() => {
                this.flipState = 'notFlipped';
            }, 800);
        }, 850);
        this.flipState = 'flipped';
    }

    connect() {
        this.navCtrl.push(this.connectPage);
    }

    socket() {
        this.navCtrl.push(testSocket);
    }

    request() {
        this.navCtrl.push(AboutPage);
    }

    ionViewDidEnter() {
        /*
         * Regarde si la session est déjà active ou pas, et si non, charge le
         * token de l'utilisateur depuis les données persistantes
         */
        if (!this.user.token) {
            this.storageService.getToken().then((token) => {
                console.log("Token : " + token);
                this.user.token = token;
            }, (err) => {
                console.log("not logged in");
            });
        }

    }
}