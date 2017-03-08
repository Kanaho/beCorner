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
        let albums: Array<Album> = [];
        NativeStorage.getItem('onWaiting').then((result) => {
            albums = result.albums;
            albums.push({
                id: albumId,
                title: "Not First",
                date: null
            });
            NativeStorage.remove('onWaiting');
            this.createAlbum(albumId, albums);
            console.log("album added");
        }, (err) => {
            if (err.code == 2) {
                //La file d'attente n'existe pas encore
                albums.push({
                    id: albumId,
                    title: "First",
                    date: null
                });
                this.createAlbum(albumId, albums);
                console.log("album stored");
            }
        })
    }

    private createAlbum(albumId: string, albums: Array<Album>) {
        NativeStorage.setItem('onWaiting', {albums: albums});
        let pictures: Photo[] = [];
        NativeStorage.setItem(albumId, {pictures: pictures});
    }

    getAlbums(): Promise<Array<Album>> {
        return NativeStorage.getItem('onWaiting').then((results) => {
            return results.albums;
        })
    }

    /*getAlbums(): Promise<Array<Album>> {
        let albums: Array<Album> = [];
        return NativeStorage.getItem('onWaiting').then((results) => {
            let promises = [];
            for (let result of results.albums) {
                console.log(result);
                let promise = this.getOneAlbum(result).then((title) => {
                      albums.push({
                        id: result,
                        title: title,
                        date: null
                    });
                });
                promises.push(promise);
            }
            return Promise.all(promises).then(()=> {return albums;});
        }, (err) => {
            if (err.code != 2) {
                console.log("getAlbums : " + JSON.stringify(err));
                return Promise.reject(err);
            }
            })
    }*/

    removeAlbum(albumId: string) {
        NativeStorage.remove(albumId).then(() => {
            NativeStorage.getItem('onWaiting').then((result) => {
                let albums: Array<Album> = [];
                albums = result.albums;
                let album = this.findAlbum(albums, albumId);
                if (album) {
                    albums.splice(albums.indexOf(album), 1);
                    NativeStorage.remove('onWaiting');
                    NativeStorage.setItem('onWaiting', {albums: albums});
                }
            })
        }, (err) => {
            if(err.code == 2) console.log("Cannot remove album on server");
            console.log("removeAlbum " + err)
        });
    }

    editAlbum(albumId: string, title: string) {
        NativeStorage.getItem('onWaiting').then((result) => {
            let albums: Array<Album> = [];
            albums = result.albums;
            let album = this.findAlbum(albums, albumId);
            if (album) {
                album.title = title;
                NativeStorage.remove('onWaiting');
                NativeStorage.setItem('onWaiting', {albums: albums});
            } else {
                //L'album n'existe que sur le serveur
            }
        })
    }

    private findAlbum(albums: Array<Album>, albumId: string) {
        for (let album of albums) {
            if (album.id == albumId) return album
        }
        return null;
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
            NativeStorage.setItem(albumId, {pictures: pictures});
        }, (err) => {
            console.log("storePicture : " + err);
        })
    }
    
    deletePictures(albumId: string, photoId: string[]){
        let find, i;
        let tempPic: Array<Photo> = []
        return NativeStorage.getItem(albumId).then((result) => {
            let pictures: Photo[] = [];
            pictures = result.pictures;
            console.log("All pics" + JSON.stringify(pictures));
            for(let pic of pictures){
                find = false;
                i = 0;
                console.log("Pic looked : " + JSON.stringify(pic));
                while (!find && i < photoId.length){
                    console.log("ID looked :" + JSON.stringify(photoId[i]))
                    if (find = (pic.idphoto == photoId[i])){
                         photoId.splice(i ,1);
                    }
                    i++;
                }
                if (!find) tempPic.push(pic);
            }
            console.log("Pic restantes : " + JSON.stringify(tempPic));
            NativeStorage.remove(albumId);
            NativeStorage.setItem(albumId, {pictures: tempPic});
        })
    }
}