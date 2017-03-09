import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {ServerService} from './server.service';
import 'rxjs/add/operator/map';
import * as io from 'socket.io-client';
import {User} from './user';

@Injectable()
export class SocketService{
    socketObserver: any;
    socketService: any;
    socket: any;
    data: any = null;
    socketHost: string = 'https://api.becorner.dev:5435';
    
    constructor(private user: User, private server: ServerService){
        this.socketService = Observable.create(observer =>{
            this.socketObserver = observer;
        });      
    }
    
    initialize(){
        this.socket = io.connect(this.socketHost, {secure: true, mutliplex: false, query: 'token=' + this.user.token});
        
        this.socket.on("connect", (msg) => {
            console.log('on connect');
            this.server.doWaitingAction();
            this.socketObserver.next({ category: 'connect', message: 'connected'});
        });
        
        this.socket.on('disconnect', function(){
            console.log('disconnected');
        });
        
        this.socket.on('message', (msg) => {
            console.log(msg);
            this.socketObserver.next({ category: 'message', message: msg});
        });
        
        this.socket.on('thumbnail', (msg) => {
            console.log(msg);
            this.socketObserver.next({category: 'thumbnail', message: msg});
        })
    }
    
    sendMessage(message: string){
        this.socket.emit('message', message);
        this.socketObserver.next({ category: 'send', message: message});
    }
}