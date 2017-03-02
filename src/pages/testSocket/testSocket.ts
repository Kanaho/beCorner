import {Component, NgZone} from '@angular/core';
import {Http} from "@angular/http";
import * as io from "socket.io-client";
import {SocketService} from '../util/socket.service';


@Component({
    selector: "testSock",
    templateUrl: "testSocket.html",
})

export class testSocket{
    messages: any;
    chatBox: string;
    socketHost: string;
    zone: NgZone;
    
    constructor(public socket: SocketService, http: Http){
        this.messages = [];
        this.socketHost = "https://socket.io/docs/server-api/";
        this.zone = new NgZone({enableLongStackTrace: false});
        
        this.chatBox = "";
        this.socket.socketService.subscribe(event =>{
            console.log('from serveur..', event);
            if(event.category === 'message'){
                this.zone.run(() =>{
                    this.messages.push(event.message);
                });
            }
        });
    }
    
    send(message){
        let newMsg = message;
        if(newMsg){
            this.socket.sendMessage(newMsg);
            this.messages.push(newMsg);
            console.log('send message..', newMsg);
        } 
        this.chatBox = "";
    }
}