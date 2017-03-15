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

    getAlbums(): Promise<Array<Album>> {
        return NativeStorage.getItem('transaction').then((results)=>{
            let albums: Array<Album> = [];
            for(let action of results.actions){
                if (action.action == ActionType.Create){
                    albums.push(action.album);
                }
            }
            return albums;
        }, (err)=>{
            if (err.code == 2) return [];
        });
    }
    
    getPictures(albumId: number) {
        return NativeStorage.getItem('transaction').then((results)=>{
            let pictures: Array<Photo> = [];
            for(let action of results.actions){
                if (action.album.id == albumId && action.action == ActionType.Add){
                    pictures = pictures.concat(action.pictures);
                }
            }
            return pictures;
        }, (err)=>{
            if (err.code == 2) return [];
        });
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
        let storedId: Array<[number, number]> = [];
        let toStore: [number, number] = [id, null];
        NativeStorage.getItem('waitingId').then((result) => {
            storedId = result.storedId;
            storedId.push(toStore);
            NativeStorage.remove('waitingId');
            NativeStorage.setItem('waitingId', {storedId: storedId});
        }, (err) => {
            if (err.code == 2) {
                storedId.push(toStore);
                NativeStorage.setItem('waitingId', {storedId: storedId});
            }
        })
    }

    storeRealId(idTemp: number, idReal: number) {
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
            return true;
        }, (err) => {
            return false;
        })
    }

    getRealId(idTemp: number) {
        return NativeStorage.getItem('waitingId').then((result) => {
            for (let idTuple of result.storedId) {
                if (idTuple[0] == idTemp) {
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