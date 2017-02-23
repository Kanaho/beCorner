import { Component }        from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'menuPage',
  templateUrl: 'menu.html',
})
export class MenuPage {
  private heure: number;
  private minute: number;
  
  constructor(public navCtrl: NavController) {
      this.heure = 24;
      this.minute = 42;
  }
  
  getPadding(){
      return ((window.innerWidth/2)-75);
  }

  goBack(){
      this.navCtrl.pop();
  }
}