import {Injectable} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AppHttpService} from './app-http.service';
import {UploadService} from './upload.service';
import {StorageService} from './storage.service'
import {AlbumService} from './album.service';
import {Photo} from './photo';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()
export class ServerService {

    constructor(private appHttp: AppHttpService, private http: Http,
        private uploadService: UploadService, private storage: StorageService,
        private albumService: AlbumService) {}

    /*
     * Connect via Facebook
     */
    fbConnect(token: string, id: string, mail?: string): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/auth/facebookLogin';

        let params = new URLSearchParams();
        params.set('token', token);
        params.set('id', id);
        if (mail != null) params.set('mail', mail);

        return this.http
            .get(serveurUrl, {search: params})
            .map(response => <string[]> response.json());

    }

    requestAlbums(token: string): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/album/getAlbums';

        let params = new URLSearchParams();

        return (this.request(serveurUrl, params));
    }

    createAlbums(title?: string): Observable<string[]> {

        console.log("create");
        let serveurUrl = 'http://api.becorner.dev/album/createAlbum';

        let params = new URLSearchParams();
        params.set('album_name', title);

        return (this.request(serveurUrl, params));
    }

    editAlbums(id: string, title: string): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/album/updateAlbum';

        let params = new URLSearchParams();
        params.set('idalbum', id);
        params.set('album_name', title);

        return (this.request(serveurUrl, params));
    }

    deleteAlbums(id: string): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/album/deleteAlbum';

        let params = new URLSearchParams();
        params.set('idalbum', id);

        return (this.request(serveurUrl, params));
    }

    addPictures(pictures: string[], id: string) {

        let serveurUrl = 'http://api.becorner.dev/upload/list';

        let params = {idalbum: id, list: pictures}

        return this.appHttp.post(serveurUrl, params);
    }

    deletePictures(idPics: string[], idAlbum: string) {

        let serveurUrl = 'http://api.becorner.dev/photo/deletePhoto';

        let params = {idalbum: idAlbum, list: idPics};

        return this.appHttp.post(serveurUrl, params);
    }

    getPictures(idAlbum: string) {

        let serveurUrl = 'http://api.becorner.dev/photo/getPhotos';

        let params = {idalbum: idAlbum};

        return this.appHttp.post(serveurUrl, params);
    }

    uploadPicture(picture: Photo, albumId: string) {
        this.uploadService.preparePicture(picture).then((result) => {
            this.uploadService.uploadImage(albumId);
        });

    }

    private request(serveurUrl: string, params: URLSearchParams) {
        return this.appHttp
            .get(serveurUrl, {search: params})
            .map(response => <string[]> response.json());
    }

    doWaitingTask() {
        this.storage.getAlbums().then((result) => {
            for (let album of result) {
                this.createAlbums(album.title).subscribe((result) => {
                    let jsonString = JSON.stringify(result);
                    let jsonObject = JSON.parse(jsonString);
                    this.storage.getPictures(album.id).then((picts) => {
                        let i = 0;
                        for (let pic of picts) {
                            let pictures: string[] = [pic.src];
                            this.addPictures(pictures, jsonObject.idalbum).subscribe((response) => {
                                let jsonString = JSON.stringify(response);
                                let jsonResponse = JSON.parse(jsonString);
                                let jsonObject = JSON.parse(jsonResponse._body);
                                pic.idphoto = jsonObject.photos[0].idphoto;//jsonObject[0] parce que envoi d'une seule photo
                                pic.name = jsonObject.photos[0].name;
                                this.uploadPicture(pic, jsonObject.idalbum);
                                if(i >= picts.length-1){
                                    this.storage.removeAlbum(album.id);
                                    this.albumService.deleteAlbum(album.id);
                                }
                                i++;
                            }, (err) => {
                                console.log("addPicturesSync" + JSON.stringify(err));
                            })
                        }
                    }, (err) => {
                        console.log("getPicturesSync" + JSON.stringify(err));
                    })
                }, (err) => {
                    console.log("createAlbumSync" + JSON.stringify(err));
                })
            }
        }, (err) => {
            console.log("getAlbumSync" + JSON.stringify(err));
        })
    }
}