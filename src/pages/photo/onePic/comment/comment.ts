import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'commentPop',
  templateUrl:"comment.html"
})
export class CommentPop {
  private commentaire: string;
  
  constructor(public viewCtrl: ViewController) {}
  
  confirm(){
      this.viewCtrl.dismiss(this.commentaire);
  }
}	
