import { Component }        from '@angular/core';
import { Observable }       from 'rxjs/Observable';

import { NavController } from 'ionic-angular';

import {WikiService} from './wiki.service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
    providers: [ WikiService ]
})
export class AboutPage {

  constructor(public navCtrl: NavController, 
      private wikipediaService: WikiService) {
  }

  items: Observable<string[]>;
  search (term: string) {
    this.items = this.wikipediaService.search(term);
  }
}
