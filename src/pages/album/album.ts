import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

import {PhotoPage} from '../photo/photo';


@Component({
    selector: 'album-page',
    templateUrl: 'album.html',
})
export class AlbumPage{
    private showMine: boolean = true;
    private showShared: boolean = true;
    private myAlbums: Array<Album> = [];

    constructor(public navCtrl: NavController) {
        this.myAlbums.push({id: 1, title: 'DeLuxe'});
        this.myAlbums.push({id: 155, title: 'duTitle'});
    }


    switchMine() {
        this.showMine = !this.showMine;
    }

    switchShared() {
        this.showShared = !this.showShared;
    }

    newAlbum(): void{
        this.navCtrl.push(PhotoPage);
    }

    goToPic(alb: Album):void{
        this.navCtrl.push(PhotoPage, {albumId: alb.id, albumTitle: alb.title});
    }
    
    goRoot(): void {
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
}

interface Album{
    id: number;
    title: string;
}
