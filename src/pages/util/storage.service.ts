import {Injectable} from '@angular/core';
import {NativeStorage, File} from 'ionic-native';
import {UploadService} from './upload.service';
import {Photo} from './photo';

declare var cordova: any;

@Injectable()
export class StorageService {

    constructor() {}

    storeUser(token: string) {
        NativeStorage.setItem('myuser', {token: token}).then((user) => {
            console.log(user.token);
        });
    }

    delUser() {
        NativeStorage.remove('myuser');
    }

    storeToken(token: string) {
        NativeStorage.setItem('mytoken', {token: token}).then((token) => {
            console.log(token.token);
        });
    }

    getToken() {
        return NativeStorage.getItem('mytoken').then((user) => {
            return Promise.resolve(user.token);
        }, (err) => {
            return Promise.reject("User not registered");
        })
    }

    deleteToken() {
        NativeStorage.remove('mytoken');
    }

    existPic(picture: Photo) {
        File.checkFile(cordova.file.cacheDirectory, picture.src.substring(picture.src.lastIndexOf('/') + 1)).then(
            (result) => {
                console.log(result);
            }, (err) => {
                console.log(err);
            });
    }

    storeAlbum(albumId: string) {
        let albums: string[] = [];
        NativeStorage.remove('onWaiting');
        NativeStorage.getItem('onWaiting').then((result) => {
            albums = result.albums;
            albums.push(albumId);
            NativeStorage.remove('onWaiting');
            this.createAlbum(albumId, albums);
            console.log("album added");
        }, (err) => {
            if (err.code == 2) {
                //La file d'attente n'existe pas encore
                albums.push(albumId);
                this.createAlbum(albumId, albums);
                console.log("album stored");
            }
        })
    }

    private createAlbum(albumId: string, albums: string[]) {
        NativeStorage.setItem('onWaiting', {albums: albums});
        NativeStorage.setItem(albumId, {title: null, pictures: null});
    }

    getAlbums(): Promise<Array<Album>> {
        let albums: Array<Album> = [];
        return NativeStorage.getItem('onWaiting').then((results) => {
            for (let result of results.albums) {
                console.log(result);
                //this.getOneAlbum(result).then((title) => {
                    albums.push({
                        id: result,
                        title: "alb.title",
                        date: null
                    })
                //})
            }
            return Promise.resolve(albums);
        }, (err) => {
            console.log("getAlbums : " + err);
            return Promise.reject(err);
        })
    }

    private getOneAlbum(result) {
        return NativeStorage.getItem(result).then((alb) => {
            return Promise.resolve(alb.title);
        }, (err) => {
            console.log("getOneAlbum : " + JSON.stringify(err));
        })
    }

    getPictures(albumId: string): any {
        let pictures: Photo[] = [];
        NativeStorage.getItem(albumId).then((result) => {
            return Promise.resolve(result.pictures);
        }, (err) => {
            return Promise.reject(err);
        })
    }

    storePicture(pic: Photo, albumId: string) {
        NativeStorage.getItem(albumId).then((result) => {
            let pictures: Photo[] = [];
            if (result.pictures != null) pictures = result.pictures;
            pictures.push(pic);
            NativeStorage.remove(albumId);
            NativeStorage.setItem(albumId, {title: result.title, pictures: pictures});
        }, (err) => {
            console.log("storePicture : " + err);
        })
    }
}