import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

@Component({
    selector: 'print-info',
    templateUrl: 'print.html'
})

export class PrintInfo {
    private format:string[] = [];
    private grid: string[][] = [];
    private selected: string;
    private colLength: number = 100/2;
    
    constructor(){
        this.format.push("15 x 21");
        this.format.push("13 x 18");
        this.format.push("18 x 18");
        this.format.push("21,0 x 29,7");
        this.format.push("25 x 25");
        this.format.push("25 x 30");
        this.setupGrid();
    }
    
    setupGrid(){
        let rowNum = 0;
        let perRow = 2;
        for (let i = 0; i < this.format.length; i+=perRow){
            this.grid[rowNum] = [];
            for(let j=0; j<perRow; j++){
                if (this.format[i+j])
                this.grid[rowNum][j] = this.format[i+j];
            }
            rowNum++;
        }
    }
    
    getHeight(){
        return (window.screen.height*.5)-70;
    }
    
    onSelect(sel: string){
        if (this.selected ==sel){
            this.selected = null;
        }else{
            this.selected=sel;
        }
        
    }
    
    addToCart(){
        
    }
}
