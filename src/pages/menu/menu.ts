import {Component, ViewChild} from '@angular/core';

import {NavController, PopoverController, NavParams} from 'ionic-angular';

import {ServerService} from '../util/server.service';
import {AlbumService} from '../util/album.service';
import {PlusPage} from '../plus/plus';
import {DeletePop} from './delete/delete';

@Component({
    selector: 'menuPage',
    templateUrl: 'menu.html'
})

export class MenuPage {
    private albumId: string;
    private heure: number;
    private minute: number;
    private state: string;
    plusPage = PlusPage;
    null: any = null;

    constructor(public navCtrl: NavController, private serverService: ServerService,
        public popoverCtrl: PopoverController, public params: NavParams,
        private albumService: AlbumService) {
        this.albumId = params.get('albumId');
        this.heure = 24;
        this.minute = 42;
    }

    getPadding() {
        return ((window.innerWidth / 2) - 75);
    }

    goBack() {
        this.navCtrl.pop();
        this.state = "back";
    }
    
    deleteAlbum(){
        this.navCtrl.pop();
        this.state = "delete";
    }

    ionViewDidLeave(){
        if(this.state == "delete") this.presentDelete();
    }
    
    presentDelete(){
        let popover = this.popoverCtrl.create(DeletePop);
        popover.present();
        popover.onDidDismiss((choice: boolean) =>{
            if(choice){
                console.log('Album supprimé');
                this.serverService.deleteAlbums(this.albumId).subscribe((result) =>{
                    this.albumService.deleteAlbum(this.albumId);
                    this.navCtrl.pop({animation: 'fade-transition', direction: 'back'});
                })
            }
        })
    }
    goPlus() {
        this.navCtrl.push(this.plusPage);
    }
}