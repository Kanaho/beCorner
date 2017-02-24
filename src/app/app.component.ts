import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar, Splashscreen, Deeplinks} from 'ionic-native';

import { HomePage } from '../pages/home/home';
import {PhotoService} from '../pages/photo/album/photo.service';
import {User} from '../pages/connect/user/user';
import {PhotoPage} from '../pages/photo/photo';


@Component({
  templateUrl: 'app.html',
  providers: [PhotoService, User]
})
export class MyApp {
  rootPage = HomePage;
  @ViewChild(Nav) navChild:Nav;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      
      Deeplinks.routeWithNavController(this.navChild, {
          '/album/:albumId': PhotoPage
      }).subscribe((match) =>{
          console.log('Successfully routed', match);
      }, (nomatch) =>{
          console.log('Routing failed', nomatch);
      })
    });
  }
}
