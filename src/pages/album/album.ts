import {Component, OnDestroy} from '@angular/core';

import {NavController} from 'ionic-angular';
import {Network} from 'ionic-native';

import {ServerService} from '../util/server.service';
import {StorageService} from '../util/storage.service';
import {AlbumService} from '../util/album.service';
import {PhotoPage} from '../photo/photo';
import {ActionType} from '../util/action';


@Component({
    selector: 'album-page',
    templateUrl: 'album.html',
})
export class AlbumPage implements OnDestroy{
    private connectSub: any
    private showMine: boolean = true;
    private showShared: boolean = true;

    constructor(public navCtrl: NavController,
        private serverService: ServerService,
        private storageService: StorageService,
        private albumService: AlbumService) {
        this.handleNetwork();
        this.displayAlbums();
    }

    ngOnDestroy(){
        this.connectSub.unsubscribe();
    }
    
    private displayAlbums() {
        this.albumService.clearAll();
        Network.type != "none" ? this.collectAlbums() : this.getAlbums();
    }

    private handleNetwork() {
        let online = Network.type != "none";
        this.connectSub = Network.onConnect().subscribe(() => {
            if (!online) {//Si il n'était pas en ligne
                online = true;
                console.log("Album connected");
                this.displayAlbums();
            }
        })
    }

    private collectAlbums() {
        //Récupère les albums depuis le serveur
        this.serverService.requestAlbums().subscribe((response) => {
            let jsonString = JSON.stringify(response);
            let jsonObject = JSON.parse(jsonString);
            for (let object of jsonObject.albums) {
                this.albumService.addAlbum({
                    id: object.idalbum, title: object.album_name,
                    date: object.date_create
                });
            }
        })
    }

    private getAlbums() {
        //Récupère les albums hors-ligne
        this.storageService.getAlbums().then((result) => {
            for (let album of result) {
                this.albumService.addAlbum(album);
            }
        }, (err) => {
            if (err.code != 2) console.log("getAlbums : " + JSON.stringify(err));
        });
    }

    switchMine() {
        this.showMine = !this.showMine;
    }

    switchShared() {
        this.showShared = !this.showShared;
    }

    newAlbum(): void {
        if (Network.type != "none") {
            this.requestNewAlbum();
        } else {
            //Pas connecté
            this.stockNewAlbum();
        }
    }

    private requestNewAlbum() {
        this.serverService.createAlbums().subscribe((result) => {
            let jsonString = JSON.stringify(result);
            let jsonObject = JSON.parse(jsonString);
            let album = {
                id: jsonObject.idalbum, title: null,
                date: null
            }
            this.goToPic(album);
        }, (err) => {
            console.log("impossible de créer un album" + err);
        });
    }

    private stockNewAlbum() {
        //Prepare un album dont l'id sera demandé au serveur à la (re)connexion
        let tempAlb = {
            id: -Date.now(),
            title: "",
            date: null
        }
        this.goToPic(tempAlb);
        //this.storageService.storeAlbum(tempAlb);
        this.storageService.storeAction(tempAlb, ActionType.Create, []);
    }

    goToPic(alb: Album): void {
        this.navCtrl.push(PhotoPage, {album: alb});
        this.albumService.addAlbum(alb);
    }

    goRoot(): void {
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
}
