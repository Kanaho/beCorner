import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'deletePop',
  templateUrl:"delete.html"
})
export class DeletePop {
  
  constructor(public viewCtrl: ViewController) {}
  
  confirm(choice: boolean){
      this.viewCtrl.dismiss(choice);
  }
  
}	
