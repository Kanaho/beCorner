import {Component} from '@angular/core';

import {NavController, AlertController, Platform} from 'ionic-angular';

import {User} from '../util/user';
import {SignPage} from '../connect/sign/sign';
import {GooglePlus, Facebook} from 'ionic-native';

import {ServerService} from '../util/server.service';
import {StorageService} from '../util/storage.service';
import { Observable }       from 'rxjs/Observable';

@Component({
    selector: 'connect',
    templateUrl: 'connect.html'
})

export class ConnectPage {
    private username: string ="";
    private password: string ="";
    signPage = SignPage;
    FB_APP_ID: number = 952935814738643;

    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController,
        public plt: Platform,
        private user: User,
        private serverService: ServerService,
        private storageService: StorageService) {
        Facebook.browserInit(this.FB_APP_ID, "v2.8").then((msg) => {
            console.log("Succeed :" + msg);
        }, (err) => {
            console.log("Error :" + err);
        });
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
            'webClientId': '423852721492-dq82pkggdo6optamipfisvss1jtser6b.apps.googleusercontent.com',
            'offline': true,
        }).then((result) =>
            console.log("Login Succed" + JSON.stringify(result))
            , (err) => {console.log(JSON.stringify(err))});
    }

    facebookLogin() {
        let permissions = new Array();
        permissions = ["public_profile", "user_photos"];

        Facebook.login(permissions).then((response) => {
            console.log(response.authResponse.accessToken);
            this.connectServer(response.authResponse.accessToken, 
                response.authResponse.userID);
        },
            function (error) {
                alert("Fail: " + error);
            });
    }

    connectServer(token: string, id: string) {
        this.serverService.fbConnect(token, id).subscribe(
            (response) => {
                let jsonString = JSON.stringify(response);
                let jsonObject = JSON.parse(jsonString);
                this.user.token = jsonObject.token;
                this.storageService.storeToken(this.user.token);
            });
    }

    LogOut() {
        this.user.token = null;
        this.storageService.deleteToken();
        alert("Logged out");
    }
}