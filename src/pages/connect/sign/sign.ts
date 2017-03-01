import {Component} from '@angular/core';

import {NavController, AlertController} from 'ionic-angular';

import {User} from '../../util/user'

@Component({
    selector: 'signPage',
    templateUrl: 'sign.html'
})

export class SignPage {
    private message: string = "";
    private username: string;
    private password: string;
    private mail: string;

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private user: User) {};

    submit(): void {
        if (this.accountValid()) {
            this.user.username = this.username;
            this.user.password = this.password;
            this.user.mail = this.mail;
            this.navCtrl.popToRoot();
            console.log('account create');
        }
        this.message = "";
    }

    accountValid(): boolean {
        this.message = this.checkUsername() 
        + this.checkPassword() + this.checkMail();
        if (this.message.length > 0) {
            let alert = this.alertCtrl.create({
                subTitle: "Ce compte n'est pas valable : ",
                message: this.message,
                buttons: ['OK'],
                enableBackdropDismiss: false
            });
            alert.present();
        }
        return this.message.length == 0;
    }

    checkUsername(): string {
        let msg = "";
        if (this.username) {
            if (this.username.length < 4 || this.username.length > 10) {
                msg += "Le nom d'utilisateur doit faire entre 8 et 10 caractères.</br>";
            }
        } else {
            msg += "Le nom d'utilisateur doit être spécifié";
        }
        return msg;
    }

    checkPassword(): string {
        let msg = "";
        if (this.password) {
            if (this.password.length < 5) {
                msg += "Votre mot de passe doit faire au minimum 5 caractères.";
            }
        } else {
            msg += "Votre mot de passe ne peut pas être vide.";
        }
        return msg;
    }

    checkMail(): string {
        let msg = "";
        if (this.mail) {
            if (this.mail.lastIndexOf('@') >= this.mail.lastIndexOf('.')) {
                msg += "L'adresse mail n'est pas valable."
            }
        }
        return msg;
    }

}