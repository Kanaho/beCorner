import {Component, ViewChild} from '@angular/core';

import {NavController, PopoverController} from 'ionic-angular';

import {PlusPage} from '../plus/plus';
import {DeletePop} from './delete/delete';

@Component({
    selector: 'menuPage',
    templateUrl: 'menu.html'
})

export class MenuPage {
    private heure: number;
    private minute: number;
    private state: string;
    plusPage = PlusPage;
    null: any = null;

    constructor(public navCtrl: NavController, public popoverCtrl: PopoverController) {
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
                console.log('Album supprimé')
            }
        })
    }
    goPlus() {
        this.navCtrl.push(this.plusPage);
    }
}