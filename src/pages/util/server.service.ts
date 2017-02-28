import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()
export class ServerService{
    constructor(private http: Http){}
    
    connect(token: string, id: string, mail?: string): Observable<string[]>{
        
        let serveurUrl = 'http://api.becorner.dev/auth/facebookLogin';
        
        let params = new URLSearchParams();
        params.set('token', token);
        params.set('id', id);
        if(mail != null) params.set('mail', mail);
        
        console.log('request ready');
        
        return this.http
            .get(serveurUrl, {search: params})
            .map(response => <string[]> response.json());
            
    }
}