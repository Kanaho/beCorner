import { Injectable } from '@angular/core';
import { NativeStorage} from 'ionic-native';


@Injectable()
export class StorageService{
    constructor(){}
    
    storeUser(token: string){
        NativeStorage.setItem('myuser', {token: token});
    }
    
    delUser(){
        NativeStorage.remove('myuser');
    }
    
    getToken(){
        NativeStorage.getItem('myuser').then((user) =>{
            return user.token;
        })
    }
}