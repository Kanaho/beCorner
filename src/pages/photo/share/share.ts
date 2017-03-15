import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'sharePop',
  templateUrl:"share.html"
})

export class SharePop {
  private choice: string;
  
  constructor(public viewCtrl: ViewController) {}
  
  confirm(){
      this.viewCtrl.dismiss(this.choice);
  }
}	
