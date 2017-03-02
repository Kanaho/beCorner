import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import {AppHttpService} from './app-http.service';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()
export class ServerService{
    constructor(private appHttp: AppHttpService, private http: Http){}
    
    /*
     * Connect via Facebook
     */
    fbConnect(token: string, id: string, mail?: string): Observable<string[]>{
        
        let serveurUrl = 'http://api.becorner.dev/auth/facebookLogin';
        
        let params = new URLSearchParams();
        params.set('token', token);
        params.set('id', id);
        if(mail != null) params.set('mail', mail);
        
        return this.http
            .get(serveurUrl, {search: params})
            .map(response => <string[]> response.json());
            
    }
    
    requestAlbums(token: string): Observable<string[]>{
        
        let serveurUrl = 'http://api.becorner.dev/album/getAlbums';
        
        let params = new URLSearchParams();
        //params.set('token', token);
        
        return (this.request(serveurUrl, params));
    }
    
    createAlbums(title?: string): Observable<string[]>{
        
        console.log("create");
        let serveurUrl = 'http://api.becorner.dev/album/createAlbum';
        
        let params = new URLSearchParams();
        //params.set('token', token);
        
        return (this.request(serveurUrl, params));
    }
    
    editAlbums(title: string, id: string): Observable<string[]>{
        
        let serveurUrl = 'http://api.becorner.dev/album/updateAlbum';
        
        let params = new URLSearchParams();
        params.set('idalbum', id);
        params.set('album_name', title);
        
        return (this.request(serveurUrl, params));
    }
    
    deleteAlbums(id: string): Observable<string[]>{
        
        let serveurUrl = 'http://api.becorner.dev/album/deleteAlbum';
        
        let params = new URLSearchParams();
        params.set('idalbum', id);
        
        return (this.request(serveurUrl, params));
    }
    
    addPictures(pictures: string[], id?: string){
        
        let serveurUrl = 'http://api.becorner.dev/upload/list';
        
        let params = {idalbum: id, list: pictures}
        
        return this.appHttp.post(serveurUrl, params);
    }
    
    deletePictures(idPics: string[], idAlbum: string){
        
        let serveurUrl = 'http://api.becorner.dev/photo/deletePhoto';
        
        let params = {idalbum: idAlbum, list: idPics};
        
        return this.appHttp.post(serveurUrl, params);
    }
    
    getPictures(idPics: string[], idAlbum: string){
        
        let serveurUrl = 'http://api.becorner.dev/photo/getPhoto';
        
        let params = {idalbum: idAlbum, list: idPics};
        
        return this.appHttp.post(serveurUrl, params);
    }
    
    private request(serveurUrl: string, params: URLSearchParams){
        return this.appHttp
            .get(serveurUrl, {search: params})
            .map(response => <string[]> response.json());
    }
}