import {Component} from '@angular/core';

//Transition
import {trigger, state, style, transition, animate} from '@angular/core';

import {NavController} from 'ionic-angular';
import {LocalNotifications, Network} from 'ionic-native';

import {AlbumPage} from '../album/album';
import {PhotoPage} from '../photo/photo';
import {ConnectPage} from '../connect/connect';
import {SocketService} from '../util/socket.service';
import {StorageService} from '../util/storage.service';
import {ServerService} from '../util/server.service';
import {User} from '../util/user';

import {tokenNotExpired, JwtHelper} from 'angular2-jwt';

import {OrderPage} from '../order/order';

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
    photoPage = PhotoPage;
    connectPage = ConnectPage;
    flipState: String = 'notFlipped';

    constructor(public navCtrl: NavController,
        private storageService: StorageService,
        private socket: SocketService,
        private serveur: ServerService,
        private user: User) {}

    getPaddingTop() {
        return (window.innerHeight / 100) * 25;
    }

    toPictures() {
        setTimeout(() => {
            if (this.user.token) {
                this.navCtrl.push(this.albumPage, null, {animation: 'fade-transition', direction: 'forward'});
            } else {
                this.navCtrl.push(this.photoPage, null, {animation: 'fade-transition', direction: 'forward'});
            }
            setTimeout(() => {
                this.flipState = 'notFlipped';
            }, 800);
        }, 850);
        this.flipState = 'flipped';
    }

    connect() {
        this.navCtrl.push(this.connectPage);
    }

    jwtHelper: JwtHelper = new JwtHelper();

    ionViewDidEnter() {
        /*
         * Regarde si la session est déjà active ou pas, et si non, charge le
         * token de l'utilisateur depuis les données persistantes
         */
        if (!this.user.token) {
            this.storageService.getToken().then((token) => {
                if (tokenNotExpired(null, token)) {
                    console.log("Token : " + token);
                    this.handleLaunchApp(token);
                } else {
                    console.log("token Expired");
                }
            }, (err) => {
                console.log("not logged in" + err);
                if (Network.type != "none")
                this.serveur.getToken().subscribe((response) => {
                    let jsonString = JSON.stringify(response);
                    let jsonResponse = JSON.parse(jsonString);
                    this.storageService.storeToken(jsonResponse.token);
                    this.handleLaunchApp(jsonResponse.token);
                })
            });
        }
        else {
            console.log(this.jwtHelper.decodeToken(this.user.token));
            console.log("logged in");
        }
    }

    private handleLaunchApp(token: string) {
        this.user.token = token;
        this.socket.initialize();
        this.socket.socketService.subscribe(event => {
            console.log('received from serveur...', event);
            if (event.category === 'thumbnail') {
                console.log("notification incoming")
                LocalNotifications.schedule({
                    text: 'Votre miniature est arrivée !',
                    sound: null
                });
            }
        })
    }
    
    order() {
        this.navCtrl.push(OrderPage);
    }
}