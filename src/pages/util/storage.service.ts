import {Injectable} from '@angular/core';
import {NativeStorage, File} from 'ionic-native';
import {Photo} from './photo';
import {Action, ActionType} from './action'

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

    storeAlbum(album: Album) {
        let albums: Array<Album> = [];
        NativeStorage.getItem('onWaiting').then((result) => {
            albums = result.albums;
            albums.push(album);
            NativeStorage.remove('onWaiting');
            this.createAlbum(album, albums);
            console.log("album added");
        }, (err) => {
            if (err.code == 2) {
                //La file d'attente n'existe pas encore
                albums.push();
                this.createAlbum(album, albums);
                console.log("album stored");
            }
        })
    }

    private createAlbum(album: Album, albums: Array<Album>) {
        NativeStorage.setItem('onWaiting', {albums: albums});
        let pictures: Photo[] = [];
        NativeStorage.setItem(album.id.toString(), {pictures: pictures});
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

    removeAlbum(albumId: number) {
        NativeStorage.remove(albumId.toString()).then(() => {
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
            if (err.code == 2) console.log("Cannot remove album on server");
            console.log("removeAlbum " + err)
        });
    }

    editAlbum(albumId: number, title: string) {
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

    private findAlbum(albums: Array<Album>, albumId: number) {
        for (let album of albums) {
            if (album.id == albumId) return album
        }
        return null;
    }

    getPictures(albumId: number) {
        return NativeStorage.getItem(albumId.toString()).then((result) => {
            return Promise.resolve(result.pictures);
        }, (err) => {
            if (err.code == 2) {
                console.log("Impossible de charger les photos");
            }
            return Promise.reject(err);
        })
    }

    storePictures(pic: Photo[], albumId: number) {
        NativeStorage.getItem(albumId.toString()).then((result) => {
            let pictures: Photo[] = [];
            pictures = result.pictures;
            for (let photo of pic) {
                pictures.push(photo);
            }
            NativeStorage.remove(albumId.toString());
            NativeStorage.setItem(albumId.toString(), {pictures: pictures});
        }, (err) => {
            if (err.code == 2) {

            }
            console.log("storePicture : " + err);
        })
    }

    deletePictures(albumId: number, photoId: number[]) {
        let find, i;
        let tempPic: Array<Photo> = []
        return NativeStorage.getItem(albumId.toString()).then((result) => {
            let pictures: Photo[] = [];
            pictures = result.pictures;
            console.log("All pics" + JSON.stringify(pictures));
            for (let pic of pictures) {
                find = false;
                i = 0;
                console.log("Pic looked : " + JSON.stringify(pic));
                while (!find && i < photoId.length) {
                    console.log("ID looked :" + JSON.stringify(photoId[i]))
                    if (find = (pic.idphoto == photoId[i])) {
                        photoId.splice(i, 1);
                    }
                    i++;
                }
                if (!find) tempPic.push(pic);
            }
            console.log("Pic restantes : " + JSON.stringify(tempPic));
            NativeStorage.remove(albumId.toString());
            NativeStorage.setItem(albumId.toString(), {pictures: tempPic});
        })
    }

    storeAction(album: Album, action: ActionType, photo: Photo[]) {
        let actions: Action[] = [];
        let newAction: Action = {action: action, album: album, pictures: photo};
        NativeStorage.getItem('transaction').then((result) => {
            actions = result.actions;
            switch (action) {
                case ActionType.Delete:
                    console.log("start delete");
                    let temp = this.checkDelAction(actions, newAction);
                    actions = temp.all;
                    newAction = temp.check;
                    if (newAction.pictures.length > 0) actions.push(newAction);
                    break;
                case ActionType.Create:
                    console.log("store id temp");
                    this.storeIdTemp(album.id);
                    actions.push(newAction);
                    break;
                case ActionType.Remove:
                    console.log("start remove");
                    actions = this.checkRemoveAction(actions, newAction);
                    break;
                case ActionType.Rename:
                    if (album.id <0) actions = this.checkRenameAction(actions, newAction);
                    else actions.push(newAction);
                    break;
                default:
                    console.log("An action added");
                    actions.push(newAction);
            };
            NativeStorage.remove('transaction');
            NativeStorage.setItem('transaction', {actions: actions});
        }, (err) => {
            if (err.code == 2) { //Le Storage Transaction n'existe pas
                console.log("A new Action");
                if (action == ActionType.Create) {
                    console.log('Need to store an id');
                    this.storeIdTemp(album.id);
                }
                actions.push(newAction);
                NativeStorage.setItem('transaction', {actions: actions});
            }
        })

    }

    /*
     * Verifie si une action d'ajout contraire en attente existe, et l'annule si
     * c'est le cas.
     */
    private checkDelAction(actions: Action[], toCheck: Action) {
        console.log("checkDelAction");
        console.log("nb action start:" + actions.length);
        let tempActions: Action[] = actions.slice(0);
        let j = 0;
        let k = 0;
        while (j < actions.length && toCheck.pictures.length > 0) {
            if ((actions[j].action == ActionType.Add) && (actions[j].album.id == toCheck.album.id)) {
                let find, i;
                let tempPic: Photo[] = [];
                for (let pic of actions[j].pictures) {
                    find = false;
                    i = 0;
                    while (!find && i < toCheck.pictures.length) {
                        if (find = (pic.idphoto == toCheck.pictures[i].idphoto)) {
                            toCheck.pictures.splice(i, 1);
                            tempActions[k].pictures.splice(tempActions[k].pictures.indexOf(pic), 1);
                        }
                        i++;
                    }
                }
                console.log("A supprimer : " + JSON.stringify(toCheck.pictures));
                console.log("Restantes : " + JSON.stringify(tempPic));
                if (tempActions[k].pictures.length == 0) {
                    //On conserve l'action
                    //actions[j].pictures = tempPic;
                    tempActions.splice(k, 1);
                    k--;
                }
            }
            j++;
            k++;
        }
        console.log("nb action end:" + actions.length);
        return {all: tempActions, check: toCheck};
    }

    private checkRemoveAction(actions: Action[], newAction: Action) {
        let tempActions: Action[] = actions.slice(0);
        for (let action of actions) {
            if (action.album.id == newAction.album.id) {
                tempActions.splice(tempActions.indexOf(action), 1);
            }
        }
        if (newAction.album.id > 0){
            //N'ajoute l'action que si elle agit sur un album sur le serveur
             tempActions.push(newAction);
        }
        return tempActions;
    }
    
    private checkRenameAction(actions: Action[], newAction: Action){
        for(let action of actions){
            if (action.action == ActionType.Create && action.album.id == newAction.album.id ){
                action.album.title = newAction.album.title;
                break;
            }
        }
        return actions;
    }

    private storeIdTemp(id: number) {
        //Tuple d'id temporaire et d'id définit par le serveur
        console.log('Store ID');
        let storedId: Array<[number, number]> = [];
        let toStore: [number, number] = [id, null];
        NativeStorage.getItem('waitingId').then((result) => {
            storedId = result.storedId;
            storedId.push(toStore);
            NativeStorage.remove('waitingId');
            NativeStorage.setItem('waitingId', {storedId: storedId});
            console.log('idTemp added')
        }, (err) => {
            if (err.code == 2) {
                storedId.push(toStore);
                NativeStorage.setItem('waitingId', {storedId: storedId});
                console.log('idTemp Stored');
            }
        })
    }

    storeRealId(idTemp: number, idReal: number) {
        console.log("StorageRealID : " + idTemp + " TO ->" + idReal);
        let storedId: Array<[number, number]> = [];
        return NativeStorage.getItem('waitingId').then((result) => {
            storedId = result.storedId;
            let i = 0;
            let find = false;
            while (!find && i < storedId.length) {
                if (find = (storedId[i][0] == idTemp)) {
                    storedId[i][1] = idReal;
                }
                i++;
            }
            NativeStorage.remove('waitingId');
            NativeStorage.setItem('waitingId', {storedId: storedId});
            console.log("Real id stored");
            return true;
        }, (err) => {
            console.log("StorageRealId " + JSON.stringify(err));
            return false;
        })
    }

    getRealId(idTemp: number) {
        return NativeStorage.getItem('waitingId').then((result) => {
            for (let idTuple of result.storedId) {
                console.log('idTuple' + JSON.stringify(idTuple));
                if (idTuple[0] == idTemp) {
                    console.log("Real Id : " + idTuple[1]);
                    return idTuple[1];
                }
            }
        }, (err) => {
            console.log("GetRealId : " + JSON.stringify(err));
        })
    }

    getWaitingAction(): Promise<Array<Action>> {
        return NativeStorage.getItem('transaction').then((result) => {
            return result.actions;
        }, (err) => {
            console.log("getWaitingAction :" + JSON.stringify(err));
            return [];
        })
    }

    cleanWaiting() {
        console.log("Clean Waiting");
        NativeStorage.remove('waitingId');
        NativeStorage.remove('transaction');
    }
}