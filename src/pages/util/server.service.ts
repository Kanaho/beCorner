import {Injectable} from '@angular/core';
import {Network} from 'ionic-native';
import {Http, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AppHttpService} from './app-http.service';
import {UploadService} from './upload.service';
import {StorageService} from './storage.service'
import {AlbumService} from './album.service';
import {Photo} from './photo';
import {Action, ActionType} from './action';
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

    editAlbums(id: number, title: string): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/album/updateAlbum';

        let params = new URLSearchParams();
        params.set('idalbum', id.toString());
        params.set('album_name', title);

        return (this.request(serveurUrl, params));
    }

    deleteAlbums(id: number): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/album/deleteAlbum';

        let params = new URLSearchParams();
        params.set('idalbum', id.toString());

        return (this.request(serveurUrl, params));
    }

    addPictures(pictures: string[], id: number) {

        let serveurUrl = 'http://api.becorner.dev/upload/list';

        let params = {idalbum: id, list: pictures}

        return this.appHttp.post(serveurUrl, params);
    }

    deletePictures(idPics: number[], idAlbum: number) {

        let serveurUrl = 'http://api.becorner.dev/photo/deletePhoto';

        let params = {idalbum: idAlbum, list: idPics};

        return this.appHttp.post(serveurUrl, params);
    }

    getPictures(idAlbum: number) {

        let serveurUrl = 'http://api.becorner.dev/photo/getPhotos';

        let params = {idalbum: idAlbum};

        return this.appHttp.post(serveurUrl, params);
    }

    uploadPicture(picture: Photo, albumId: number) {
        /*this.uploadService.preparePicture(picture).then((result) => {
            this.uploadService.uploadImage(albumId);
        });*/
        this.uploadService.uploadImage(albumId, picture.idphoto, picture.name);
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
                                if (i >= picts.length - 1) {
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

    doWaitingAction() {
        console.log("doWaiting");
        this.storage.getWaitingAction().then((result) => {
            let actions: Array<Action> = result;
            console.log("Nbr Action : " + actions.length);
            let promises = [];
            while (Network.type != "none" && actions.length > 0) {
                let promise;
                let actionsTemp: Array<Action> = [];
                for (let action of actions) {
                    switch (action.action) {
                        case ActionType.Add:
                        case ActionType.Delete: //Ajout && Suppression de photo(s)
                            console.log("doPictures");
                            promise = this.waitingPictures(action).then((success) => {
                                console.log("After doPic" + JSON.stringify(success));
                                if (!success){
                                    console.log("failure" + JSON.stringify(success));
                                     actionsTemp.push(action);
                                }
                            }, (err) =>{
                                console.log(JSON.stringify(err));
                            });
                            break;
                        case ActionType.Rename: //Changement de titre d'album
                            console.log("doEdit");
                            promise = this.waitingEdit(action)
                            break;
                        case ActionType.Create: //Creation d'album
                            console.log("doCreate");
                            promise = this.waitingCreate(action);
                            break;
                    }
                    promises.push(promise);
                }
                actions = actionsTemp;
            }
            Promise.all(promises).then(() => {
                this.storage.cleanWaiting();
            })
        })
    }

    private waitingPictures(action: Action): Promise<boolean> {
        let albumId = action.album.id;
        console.log(albumId);
        if (albumId < 0) {
            let promises = [];
            let promise = this.storage.getRealId(albumId).then((realId) => {
                if (realId != null) {
                    if (action.action == ActionType.Add) return this.doAdd(realId, action.pictures);
                    else return this.doDelete(realId, action.pictures);
                }else{
                    console.log("Id is null" + realId);
                    return false;
                }
            });
            promises.push(promise);
            Promise.all(promises).then(() => {console.log("Promise :" + JSON.stringify(promise)); return promise});
        } else {
            console.log("WaitingPic")
            if (action.action == ActionType.Add) return this.doAdd(albumId, action.pictures);
            else return this.doDelete(albumId, action.pictures);
        }
    }

    /*
     * Effectue l'action d'ajout
     */
    private doAdd(albumId: number, pictures: Photo[]) {
        console.log('doAdd');
        let promises = [];
        for (let pic of pictures) {
            let pict: string[] = [pic.src];
            let promise = this.addPictures(pict, albumId).subscribe((response) => {
                let jsonString = JSON.stringify(response);
                let jsonResponse = JSON.parse(jsonString);
                let jsonObject = JSON.parse(jsonResponse._body);
                pic.idphoto = jsonObject.photos[0].idphoto;//jsonObject[0] parce que envoi d'une seule photo
                pic.name = jsonObject.photos[0].name;
                console.log("Upload");
                this.uploadPicture(pic, jsonObject.idalbum);
            }, (err) => {
                console.log("addPicturesSync" + JSON.stringify(err));
                return Promise.reject(err);
            })
            promises.push(promise);
        }
        return Promise.all(promises).then(() => {return true;});
    }

    private doDelete(albumId: number, pictures: Photo[]) {
        console.log("doDelete")
        let promises = [];
        let pict: number[] = [];
        for (let pic of pictures) {
            pict.push(pic.idphoto);
        }
        let promise = this.deletePictures(pict, albumId).subscribe((response) => {
            console.log("Succeed deletePicturesSync")
            return Promise.resolve("succeed");
        }, (err) => {
            console.log("Failure deletePicturesSync" + JSON.stringify(err));
            return Promise.reject(err);
        })
        promises.push(promise);
        return Promise.all(promises).then(() => {return true;})
    }

    private waitingEdit(action: Action) {
        this.editAlbums(action.album.id, action.album.title).subscribe((response) => {
            console.log("EditAlbumSync " + JSON.stringify(response));
        });
    }

    private waitingCreate(action: Action) {
        this.createAlbums(action.album.title).subscribe((response) => {
            let jsonString = JSON.stringify(response);
            let jsonObject = JSON.parse(jsonString);
            this.storage.storeRealId(action.album.id, jsonObject.idalbum);
        })
    }
}