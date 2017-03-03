import {NgModule, ErrorHandler} from '@angular/core';
import {HttpModule, JsonpModule} from '@angular/http';

import {IonicApp, IonicModule, IonicErrorHandler, Config} from 'ionic-angular';

import {CloudSettings, CloudModule} from '@ionic/cloud-angular';

import {AuthModule} from '../pages/util/auth.module'

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ContactPage} from '../pages/contact/contact';
import {PhotoPage} from '../pages/photo/photo';
import {PrintInfo} from '../pages/photo/print/print';
import {MenuPage} from '../pages/menu/menu';
import {DeletePop} from '../pages/menu/delete/delete';
import {OnePic} from '../pages/onePic/onePic';
import {CommentPop} from '../pages/onePic/comment/comment';
import {ConnectPage} from '../pages/connect/connect';
import {SignPage} from '../pages/connect/sign/sign';
import {PlusPage} from '../pages/plus/plus';
import {AlbumPage} from '../pages/album/album';

import {FadeTransition} from '../pages/transition/FadeTransition';

const cloudSettings: CloudSettings = {
    'core': {
        'app_id': '9209E005'
    }
};

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ContactPage,
        PhotoPage,
        PrintInfo,
        MenuPage,
        DeletePop,
        OnePic,
        CommentPop,
        ConnectPage,
        SignPage,
        PlusPage,
        AlbumPage,
    ],
    imports: [
        IonicModule.forRoot(MyApp),
        HttpModule, JsonpModule,
        CloudModule.forRoot(cloudSettings),
        AuthModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ContactPage,
        PhotoPage,
        PrintInfo,
        MenuPage,
        DeletePop,
        OnePic,
        CommentPop,
        ConnectPage,
        SignPage,
        PlusPage,
        AlbumPage,
    ],
    providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {
    constructor(private config: Config) {
        this.config.setTransition('fade-transition', FadeTransition);
    }
}
