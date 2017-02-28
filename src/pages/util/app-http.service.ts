import {Injectable, Inject} from '@angular/core';
import {Http, Response, RequestOptionsArgs,URLSearchParams} from '@angular/http';
import {JwtHelper, AuthHttp} from 'angular2-jwt';
import {Observable} from "rxjs";
import {AppSettings} from "../app-settings";
import 'rxjs/add/operator/catch';

@Injectable()
export class AppHttpService {

    constructor(private http: AuthHttp) {
    }

    public get(url: string, options?: RequestOptionsArgs, isRetry = false): Observable<Response> {
        return this.http.get(url, options)
            .catch((error: any) => {
                if (error.status == 400 && !isRetry) {
                    this.getToken().subscribe(token => {
                        this.get(url,options,true)
                    });
                }
                return Observable.throw(error);
            });
    }

    jwtHelper: JwtHelper = new JwtHelper()
    token:any

    public getToken():Observable<any> {
        var localToken = localStorage.getItem(AppSettings.TOKEN_NAME);

        if (!localToken || this.jwtHelper.isTokenExpired(localToken)) {
            //let options = new RequestOptions({ headers: headers, withCredentials: true });
            return this.http.get(AppSettings.API_ENDPOINT + 'auth/token/getToken')
                .map((res) => res.json())
                .do(data => {this.setToken(data.token);})
                .catch((error: any) => Observable.throw(error || 'Server error'));
        } else {
            this.setToken(localToken);
            return Observable.of(this.token);
        }
    }

    private setToken(token) {
        this.token = this.jwtHelper.decodeToken(token);
        AppSettings.API_ROLE = this.token.role;
        localStorage.setItem(AppSettings.TOKEN_NAME, token);
    }
}
