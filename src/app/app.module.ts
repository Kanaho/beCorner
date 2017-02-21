import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';


import { MyApp } from './app.component';
import { HomePage} from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { PhotoPage } from '../pages/photo/photo';
import {EditPhoto} from '../pages/photo/editPhoto/editPhoto';
import { TabsPage } from '../pages/tabs/tabs';
import {ConnectPage} from '../pages/connect/connect';
import {SignPage} from '../pages/connect/sign/sign';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AboutPage,
    ContactPage,
    PhotoPage,
    EditPhoto,
    TabsPage,
    ConnectPage,
    SignPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    HttpModule, JsonpModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    ContactPage,
    PhotoPage,
    EditPhoto,
    TabsPage,
    ConnectPage,
    SignPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
