import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';


@Component({
    selector: 'panierPage',
    templateUrl: 'panier.html'
})

export class PanierPage {
    private formats: Array<string> = [];
    private formatChoose: string;
    private quantity: number;
    private quantities: Array<number> = [];
    private formatOptions = {
        title: 'Format',
        subTitle: 'Select your format'
    }
    private autreOptions = {
        title: 'Autre',
        subTitle: '\\[T]/'
    }
    private quantityOptions = {
        title: 'Quantity',
        subTitle: '\\[T]/'
    }
    
    constructor(){
        this.formats.push("Petit");
        this.formats.push("Moyen");
        this.formats.push("Grand");
        for(let i= 1; i<21; i++){
           this.quantities.push(i);
        }
    }
}