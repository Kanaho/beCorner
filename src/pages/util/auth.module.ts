import { NgModule } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import {AppSettings} from './app-settings'
import {StorageService} from '../util/storage.service';

let storageService = new StorageService();

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
    return new AuthHttp(new AuthConfig({
        noJwtError:true,
        headerPrefix:'',
        noTokenScheme:true,
        tokenGetter: (() => storageService.getToken())
    }), http, options);
}

@NgModule({
    providers: [
        {
            provide: AuthHttp,
            useFactory: authHttpServiceFactory,
            deps: [Http, RequestOptions]
        }
    ]
})
export class AuthModule {}