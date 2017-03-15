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
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ServerService {

    constructor(private appHttp: AppHttpService, private http: Http,
        private uploadService: UploadService, private storage: StorageService,
        private albumService: AlbumService) {}

    getToken(): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/auth/getToken';

        let params = new URLSearchParams();

        return this.http
            .get(serveurUrl, {search: params})
            .map(response => <string[]> response.json());

    }
    
    /*
     * Connect via Facebook
     */
    fbConnect(token: string, id: string, mail?: string) {

        let serveurUrl = 'http://api.becorner.dev/auth/facebookLogin';

        let params = new URLSearchParams();
        params.set('token', token);
        params.set('id', id);
        if (mail != null) params.set('mail', mail);

        return this.request(serveurUrl, params);

    }

    requestAlbums(): Observable<string[]> {

        let serveurUrl = 'http://api.becorner.dev/album/getAlbums';

        let params = new URLSearchParams();

        return (this.request(serveurUrl, params));
    }

    createAlbums(title?: string): Observable<string[]> {

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
        this.uploadService.preparePicture(picture).then((result) => {
            this.uploadService.uploadImage(albumId);
        });
        //this.uploadService.uploadImage(albumId, picture.idphoto, picture.name);
    }

    getShareLink(idAlbum: number, choice: string) {
        let serveurUrl = 'http://api.becorner.dev/..?';

        let params = {idalbum: idAlbum, choice: choice};

        return this.appHttp.post(serveurUrl, params);
    }

    private request(serveurUrl: string, params: URLSearchParams) {
        return this.appHttp
            .get(serveurUrl, {search: params})
            .map(response => <string[]> response.json());
    }

    /*doWaitingTask() {
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
    }*/

    doWaitingAction() {
        console.log("doWaiting");
        this.storage.getWaitingAction().then((result) => {
            this.makeActions(result);
        })
    }

    private makeActions(actions: Array<Action>) {
        console.log("Nbr Action : " + actions.length);
        let promises: Array<Promise<any>> = [];
        while (Network.type != "none" && actions.length > 0) {
            let actionsTemp: Array<Action> = [];
            let promise: Promise<any>;
            for (let action of actions) {
                switch (action.action) {
                    case ActionType.Add:
                    case ActionType.Delete: //Ajout && Suppression de photo(s)
                        console.log("doPictures");
                        promise = this.waitingPictures(action).then((success) => {
                            console.log("After doPic" + JSON.stringify(success));
                            if (!success.valueOf()) {
                                console.log("failure doPic");
                                actionsTemp.push(action);
                            }
                        }, (err) => {
                            console.log(JSON.stringify(err));
                        });
                        break;
                    case ActionType.Rename: //Changement de titre d'album
                        console.log("doEdit");
                        promise = this.waitingEdit(action).then((success) => {
                            if (!success.valueOf()) {
                                console.log("failure doEdit");
                                actionsTemp.push(action);
                            }
                        });
                        break;
                    case ActionType.Create: //Creation d'album
                        console.log("doCreate");
                        promise = this.waitingCreate(action).then((success) => {
                            if (!success.valueOf()) {
                                console.log("failure doCreate");
                                actionsTemp.push(action);
                            }
                        });
                        break;
                    case ActionType.Remove: //Suppression d'album
                        console.log("doRemove");
                        promise = this.waitingRemove(action).then((success) => {
                            if (!success.valueOf()) {
                                console.log("failure doRemove");
                                actionsTemp.push(action);
                            }
                        });
                }
                promises.push(promise);
            }
            actions = actionsTemp;
        }
        Promise.all(promises).then(() => {
            console.log(actions.length);

            if (actions.length == 0)
                this.storage.cleanWaiting();
            else
                this.makeActions(actions);
        })
    }

    private waitingPictures(action: Action): Promise<boolean> {
        let albumId = action.album.id;
        console.log(albumId);
        if (albumId < 0) {
            let promises = [];
            let promise = new Promise((resolve, reject) => {
                this.storage.getRealId(albumId).then((realId) => {
                    albumId = realId;
                    if (albumId != null) {
                        if (action.action == ActionType.Add) resolve(this.doAdd(albumId, action.pictures));
                        else resolve(this.doDelete(albumId, action.pictures));
                    } else {
                        console.log("Id is null" + albumId);
                        resolve(false);
                    }
                }, (err) => {
                    console.log("waiting Pic" + JSON.stringify(err));
                    reject(err);
                });
            })
            promises.push(promise);
            return Promise.all(promises).then(() => {console.log("Promise :" + JSON.stringify(promise)); return albumId > 0});
        } else {
            console.log("WaitingPic")
            if (action.action == ActionType.Add) return this.doAdd(albumId, action.pictures);
            else return this.doDelete(albumId, action.pictures);
        }
    }

    /*
     * Effectue l'action d'ajout
     */
    private doAdd(albumId: number, pictures: Photo[]): Promise<boolean> {
        console.log('doAdd');
        let promises = [];
        for (let pic of pictures) {
            let pict: string[] = [pic.src];
            let promise = new Promise((resolve, reject) => {
                this.addPictures(pict, albumId).subscribe((response) => {
                    let jsonString = JSON.stringify(response);
                    let jsonResponse = JSON.parse(jsonString);
                    let jsonObject = JSON.parse(jsonResponse._body);
                    pic.idphoto = jsonObject.photos[0].idphoto;//jsonObject[0] parce que envoi d'une seule photo
                    pic.name = jsonObject.photos[0].name;
                    console.log("Upload");
                    console.log("Picture" + JSON.stringify(pic));
                    this.uploadPicture(pic, jsonObject.idalbum);
                    if (jsonObject.status) resolve(true);
                    else resolve(false);
                }, (err) => {
                    console.log("addPicturesSync" + JSON.stringify(err));
                    reject(err);
                })
            })
            promises.push(promise);
        }
        return Promise.all(promises).then(() => {return true;}, (err) => {console.log("doAdd")});
    }

    private doDelete(albumId: number, pictures: Photo[]): Promise<boolean> {
        console.log("doDelete")
        let promises = [];
        let pict: number[] = [];
        for (let pic of pictures) {
            pict.push(pic.idphoto);
        }
        let promise = new Promise((resolve, reject) => {
            this.deletePictures(pict, albumId).subscribe((response) => {
                console.log("Succeed deletePicturesSync")
                let jsonString = JSON.stringify(response);
                let jsonObject = JSON.parse(jsonString);
                if (jsonObject.status) resolve(true);
                else resolve(false);
            }, (err) => {
                console.log("Failure deletePicturesSync" + JSON.stringify(err));
                reject(err);
            })
        })
        promises.push(promise);
        return Promise.all(promises).then(() => {return true;})
    }

    private waitingEdit(action: Action): Promise<boolean> {
        return new Promise((resolve, reject) => { //Pour faire d'un observable une promise et pouvoir attendre sa fin.
            this.editAlbums(action.album.id, action.album.title).subscribe((response) => {
                console.log("EditAlbumSync " + JSON.stringify(response));
                let jsonString = JSON.stringify(response);
                let jsonObject = JSON.parse(jsonString);
                if (jsonObject.status) resolve(true);
                else resolve(false);
            }, (err) => {reject(err)});
        })
    }

    private waitingCreate(action: Action): Promise<boolean> {
        return new Promise((resolve, reject) => { //Pour faire d'un observable une promise et pouvoir attendre sa fin.
            this.createAlbums(action.album.title).subscribe((response) => {
                let jsonString = JSON.stringify(response);
                let jsonObject = JSON.parse(jsonString);
                if (jsonObject.status) resolve(this.storage.storeRealId(action.album.id, jsonObject.idalbum));
                else resolve(false);
            }, (err) => {
                reject(err);
            })
        })
    }

    private waitingRemove(action: Action): Promise<boolean> {
        return new Promise((resolve, reject) => { //Pour faire d'un observable une promise et pouvoir attendre sa fin.
            this.deleteAlbums(action.album.id).subscribe((response) => {
                let jsonString = JSON.stringify(response);
                let jsonObject = JSON.parse(jsonString);
                if (jsonObject.status) resolve(true);
                else resolve(false);
            }, (err) => {
                reject(err);
            })
        })
    }
}