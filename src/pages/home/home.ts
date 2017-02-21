import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

import {PhotoPage} from '../photo/photo';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage{
    photoPage = PhotoPage;
    
    constructor(public navCtrl: NavController){}
    
    getPaddingTop(){
        return (window.innerHeight/100)*25;
    }
}