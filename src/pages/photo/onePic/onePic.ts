import {Component} from '@angular/core';

import {PhotoService} from '../album/photo.service';
import {NavController} from 'ionic-angular';

declare var Caman;
declare function require(name: string);
@Component({
    selector: 'onePic',
    templateUrl: 'onePic.html'
})

export class OnePic {
    private pic: string;
    private msg: string = "";

    //private Canvas = require('canvas');

    constructor(private photoService: PhotoService,
        public navCtrl: NavController) {
        
        this.pic = photoService.getSelected();
        //this.pic = "http://www.w3schools.com/images/w3schools_green.jpg";
 
    };

    private addFilter() {
        this.msg = ('AddFilter');
        new Caman('#myImage', function () {
            console.log()
            this.lomo();
            this.render();

        });
        this.msg = ('Filter abord');
    }
    
    exit(){
        this.navCtrl.pop({animation: 'fade-transition', direction: 'back'});
    }
}
