import { Component }        from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'logoHead',
  templateUrl: 'logoHeader.html'
})
export class logoHeader {

    constructor(private navCtrl: NavController){}
    
    goRoot(): void{
        console.log('toRoot');
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
  
}