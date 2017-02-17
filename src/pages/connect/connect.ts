import {Component} from '@angular/core';

import {NavController, AlertController} from 'ionic-angular';

import {User} from './user/user';
import {SignPage} from '../connect/sign/sign';

@Component({
    selector: 'connect',
    templateUrl: 'connect.html'
})

export class ConnectPage {
    private username: string;
    private password: string;
    signPage = SignPage;

    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController,
        private user: User) {};

    logIn(): void {

        if (!this.accountvalid()) {
            let alert = this.alertCtrl.create({
                subTitle: "Ce compte n'est pas autorisé !",
                message: "Merci d'en entrer un autre.",
                buttons: ['OK'],
                enableBackdropDismiss: false
            });
            alert.present();
        } else {
            this.user.username = this.username;
            this.user.password = this.password;
            this.navCtrl.popToRoot();
            console.log("Logged In");
        }
    }

    accountvalid(): boolean {
        let valid = false;
        if (this.username && this.password) {
            valid = this.username.length > 0 && this.password.length > 0;
        }
        return valid;
    }

}