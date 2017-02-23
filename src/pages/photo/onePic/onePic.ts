import {Component} from '@angular/core';

import {PhotoService} from '../album/photo.service';
import {NavController, NavParams, PopoverController} from 'ionic-angular';

import {CommentPop} from './comment/comment';

declare var Caman;
declare function require(name: string);
@Component({
    selector: 'onePic',
    templateUrl: 'onePic.html'
})

export class OnePic {
    private pic: string;
    private title: string;

    //private Canvas = require('canvas');

    constructor(private photoService: PhotoService,
        public navCtrl: NavController,
        public params:NavParams,
        public popoverCtrl: PopoverController) {
        
        this.pic = photoService.getSelected();
        this.title = params.get("title");
        if (!this.title) this.title = "Album";
    };

    private addFilter() {
        new Caman('#myImage', function () {
            console.log()
            this.lomo();
            this.render();

        });
    }
    
    exit(){
        this.navCtrl.pop({animation: 'fade-transition', direction: 'back'});
    }
    
    getSquareSize(){
        if (window.innerWidth > window.innerHeight){
            return window.innerWidth/2;
        }
        return window.innerWidth;
    }
    
    getBackground(){
        return "url(" +this.pic+")";
    }
    
    presentComment(){
        let popover = this.popoverCtrl.create(CommentPop);
        popover.present();
        popover.onDidDismiss((comment) =>{
            if(comment != null){
                //Popover a retourné un commentaire
                console.log('receive');
            }
            console.log(comment);
        })
    }
}
