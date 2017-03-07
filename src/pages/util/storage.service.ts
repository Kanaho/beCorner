import {Injectable} from '@angular/core';
import {NativeStorage, File} from 'ionic-native';
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
        let pictures: Photo[] = [];
        NativeStorage.setItem(albumId, {title: "Album Hors-Ligne", pictures: pictures});
    }

    /*getAlbums(): Promise<Array<Album>> {
        let albums: Array<Album> = [];
        let temp = NativeStorage.getItem('onWaiting')
            .then((results) => {
                for (let i = 0; i < results.albums.length; i++) {
                    NativeStorage.getItem(results.albums[i]).then((album) => {
                        albums.push({
                            id: results.albums[i],
                            title: album.title,
                            date: null
                        })
                    })
                }
            })
        return temp.then(() => {
            console.log(albums);
            return Promise.resolve(albums);
        })
    }*/

    getAlbums(): Promise<Array<Album>> {
        let albums: Array<Album> = [];
        return NativeStorage.getItem('onWaiting').then((results) => {
            let i = 0;
            for (let result of results.albums) {
                console.log(result);
                let alb = this.getOneAlbum(result);
                console.log(alb)
                albums.push({
                    id: result,
                    title: /*JSON.parse(JSON.stringify(alb)).value*/ "Titre",
                    date: null
                })
                i++;
                if (i >= results.albums.length) return Promise.resolve(albums);
            }
        }, (err) => {
            if (err.code != 2) {
                console.log("getAlbums : " + JSON.stringify(err));
                return Promise.reject(err);
            }
        })
    }

    getOneAlbum(result) {
        return NativeStorage.getItem(result).then((alb) => {
            return Promise.resolve(alb.title);
        }, (err) => {
            console.log("getOneAlbum : " + JSON.stringify(err));
        })
    }

    removeAlbum(albumId: string) {
        NativeStorage.remove(albumId).then(() => {
            NativeStorage.getItem('onWaiting').then((result) => {
                let albums: string[] = [];
                albums = result.albums;
                albums.splice(albums.indexOf(albumId), 1);
                NativeStorage.remove('onWaiting');
                NativeStorage.setItem('onWaiting', {albums: albums});
            })
        }, (err) => {
            console.log("removeAlbum " + err)
        });
    }

    getPictures(albumId: string) {
        return NativeStorage.getItem(albumId).then((result) => {
            return Promise.resolve(result.pictures);
        }, (err) => {
            /*if(err.code == 2)this.storeAlbum(albumId);*/
            return Promise.reject(err);
        })
    }

    storePictures(pic: Photo[], albumId: string) {
        NativeStorage.getItem(albumId).then((result) => {
            let pictures: Photo[] = [];
            pictures = result.pictures;
            for (let photo of pic) {
                pictures.push(photo);
            }
            NativeStorage.remove(albumId);
            NativeStorage.setItem(albumId, {title: result.title, pictures: pictures});
        }, (err) => {
            console.log("storePicture : " + err);
        })
    }
}