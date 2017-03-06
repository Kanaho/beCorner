import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';
import {Network} from 'ionic-native';

import {ServerService} from '../util/server.service';
import {StorageService} from '../util/storage.service';
import {AlbumService} from '../util/album.service';
import {PhotoPage} from '../photo/photo';


@Component({
    selector: 'album-page',
    templateUrl: 'album.html',
})
export class AlbumPage {
    private showMine: boolean = true;
    private showShared: boolean = true;

    constructor(public navCtrl: NavController,
        private serverService: ServerService,
        private storageService: StorageService,
        private albumService: AlbumService) {
        this.displayAlbums();
        this.handleNetwork();
    }

    private displayAlbums() {
        this.storageService.getToken().then((token) => {
            //this.albumService.clearAll();
            //this.collectAlbums(token);
            this.getAlbums();
        }, (err) => {
            console.log("cannot collect albums" + err);
        })
    }

    private handleNetwork() {
        let online = Network.type != "none";
        let connectSub = Network.onConnect().subscribe(() => {
            if (!online) {//Si il n'était pas en ligne
                online = true;
                setTimeout(() => {
                    connectSub.unsubscribe(); //Survit à la fermeture de la page
                    console.log("Album connected");
                    this.displayAlbums();
                }, 500);
            }
        })
    }

    private collectAlbums(token: string) {
        //Récupère les albums depuis le serveur
        if (Network.type != "none") {
            this.serverService.requestAlbums(token).subscribe((response) => {
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
    }
    
    private getAlbums(){
        //Récupère les albums hors-ligne
        this.storageService.getAlbums().then((result) =>{
            console.log("Album " + result);
            for (let album of result) {
                this.albumService.addAlbum(album);
            }
        }, (err) =>{
            console.log("getAlbums : " + err);
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
            this.navCtrl.push(PhotoPage, {albumId: jsonObject.idalbum});
            this.albumService.addAlbum({
                id: jsonObject.idalbum, title: null,
                date: null
            });
        }, (err) => {
            console.log("impossible de créer un album" + err);
        });
    }
    
    private stockNewAlbum(){
        //Prepare un album dont l'id sera demandé au serveur à la (re)connexion
        let tempId = Date.now().toString();
        this.navCtrl.push(PhotoPage, {albumId: tempId});
        this.storageService.storeAlbum(tempId);
    }

    goToPic(alb: Album): void {
        this.navCtrl.push(PhotoPage, {albumId: alb.id, albumTitle: alb.title});
    }

    goRoot(): void {
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
}
