import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService{
    socketObserver: any;
    socketService: any;
    socket: any;
    user: any;
    data: any = null;
    socketHost: string = 'http://192.168.1.100:8080';
    
    constructor(){
        this.socketService = Observable.create(observer =>{
            this.socketObserver = observer;
        });
        
    }
    
    initialize(){
        this.socket = io.connect(this.socketHost);
        
        this.socket.on("connect", (msg) => {
            console.log('on connect');
            this.socketObserver.next({ category: 'connect', message: 'connected'});
        });
        
        this.socket.on('disconnect', function(){
            console.log('disconnected');
        });
        
        this.socket.on('message', (msg) => {
            console.log(msg);
            this.socketObserver.next({ category: 'message', message: msg});
        });
    }
    
    sendMessage(message: string){
        this.socket.emit('message', message);
        this.socketObserver.next({ category: 'send', message: message});
    }
}