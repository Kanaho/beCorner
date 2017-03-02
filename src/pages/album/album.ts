import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

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
        this.storageService.getToken().then((token) => {
            this.albumService.clearAll();
            this.collectAlbums(token);
        }, (err) =>{
            console.log("cannot collect albums" + err);
        })
    }

    private collectAlbums(token: string) {
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


    switchMine() {
        this.showMine = !this.showMine;
    }

    switchShared() {
        this.showShared = !this.showShared;
    }

    newAlbum(): void {
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

    goToPic(alb: Album): void {
        this.navCtrl.push(PhotoPage, {albumId: alb.id, albumTitle: alb.title});
    }

    goRoot(): void {
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
}
