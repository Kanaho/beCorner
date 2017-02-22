import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';

import { IonicApp, IonicModule, IonicErrorHandler, Config } from 'ionic-angular';
//import { NativeTransitions} from 'ionic-native-transitions';

import { MyApp } from './app.component';
import { HomePage} from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { PhotoPage } from '../pages/photo/photo';
import {OnePic} from '../pages/photo/onePic/onePic';
import { TabsPage } from '../pages/tabs/tabs';
import {ConnectPage} from '../pages/connect/connect';
import {SignPage} from '../pages/connect/sign/sign';

import {FadeTransition} from '../pages/transition/FadeTransition';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AboutPage,
    ContactPage,
    PhotoPage,
    OnePic,
    TabsPage,
    ConnectPage,
    SignPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    HttpModule, JsonpModule,
    //NativeTransitions
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    ContactPage,
    PhotoPage,
    OnePic,
    TabsPage,
    ConnectPage,
    SignPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {
    constructor(private config: Config){
        this.config.setTransition('fade-transition', FadeTransition);
    }
}
