import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar, Splashscreen, Deeplinks} from 'ionic-native';

import { HomePage } from '../pages/home/home';
import {PhotoService} from '../pages/util/photo.service';
import {SocketService} from '../pages/util/socket.service';
import {ServerService} from '../pages/util/server.service';
import {StorageService} from '../pages/util/storage.service';
import {AppHttpService} from '../pages/util/app-http.service';
import {AlbumService} from '../pages/util/album.service';
import {UploadService} from '../pages/util/upload.service';
import {User} from '../pages/util/user';
import {PhotoPage} from '../pages/photo/photo';


@Component({
  templateUrl: 'app.html',
  providers: [PhotoService, User, SocketService, ServerService, 
    StorageService, AppHttpService, AlbumService, UploadService]
})
export class MyApp {
  rootPage = HomePage;
  @ViewChild(Nav) navChild:Nav;

  constructor(platform: Platform, public socket: SocketService) {
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
      });
      
    });
  }
}
