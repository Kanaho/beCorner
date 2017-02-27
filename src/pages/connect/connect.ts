import {Component} from '@angular/core';

import {NavController, AlertController, Platform} from 'ionic-angular';

import {User} from './user/user';
import {SignPage} from '../connect/sign/sign';
import {GooglePlus, Facebook} from 'ionic-native';

@Component({
    selector: 'connect',
    templateUrl: 'connect.html'
})

export class ConnectPage {
    private username: string;
    private password: string;
    signPage = SignPage;
    FB_APP_ID: number = 1851028381838808;

    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController,
        public plt: Platform,
        private user: User) {
        Facebook.browserInit(this.FB_APP_ID, "v2.8");
    };

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
        }
    }

    accountvalid(): boolean {
        let valid = false;
        if (this.username && this.password) {
            valid = this.username.length > 0 && this.password.length > 0;
        }
        return valid;
    }

    googleLogin() {
        GooglePlus.login({
            //'scopes': '',
            'webClientId': '423852721492-m7q9k10v3qbd66re8vfjpkbt0cm795eq.apps.googleusercontent.com '
        }).then(
            () =>
                console.log("Login Succed"),
            function (msg) {
                alert(msg);
                console.log(msg);
            }
            );
    }

    facebookLogin() {
        this.plt.ready().then(function () {
            let permissions = new Array();
            permissions = ["public_profile"];

            Facebook.login(permissions).then(() => {
                alert('succed');
            }, function(error){
                alert("Fail: " + error);
            })
        }, (msg) =>{
            alert(msg);
        })
    }
}