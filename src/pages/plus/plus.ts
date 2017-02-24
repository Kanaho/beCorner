import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';


@Component({
    selector: 'plus',
    templateUrl: 'plus.html'
})

export class PlusPage {
    private advantage: string[] = [];
    
    constructor(){
        this.fillAdvantage();
    }
    
    fillAdvantage(){
        this.advantage.push("Modifier la disponibilité");
        this.advantage.push("Protéger par mot de passe");
        this.advantage.push("Plus grande capacité de stockage");
        this.advantage.push("Preview de l'album");
    }
}