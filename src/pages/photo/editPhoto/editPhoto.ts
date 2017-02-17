import {Component} from '@angular/core';

import {PhotoService} from '../album/photo.service';


declare var Caman;
declare function require(name: string);
@Component({
    selector: 'edit-home',
    templateUrl: 'editPhoto.html'
})

export class EditPhoto {
    private pic: string;
    private msg: string = "";

    //private Canvas = require('canvas');

    constructor(private photoService: PhotoService) {
        
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
}
