import { Injectable } from '@angular/core';
import { NativeStorage} from 'ionic-native';


@Injectable()
export class StorageService{
    constructor(){}
    
    storeUser(token: string){
        NativeStorage.setItem("myuser", {token: token}).then((user) =>{
            console.log(user.token);
        });
    }
    
    delUser(){
        NativeStorage.remove('myuser');
    }
    
    getToken(){
        return NativeStorage.getItem('myuser').then((user) =>{
            return Promise.resolve(user.token);
        }, (err) =>{
            return Promise.reject("User not registered");
        })
    }
}