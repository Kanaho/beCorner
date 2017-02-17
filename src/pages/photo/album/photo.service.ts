import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class PhotoService{
    private selectedPic: string;
    private selPic: string[] = [];
    private picSrc: string[] = [];
    
    addPictures(temp: string[]): void{
        for (let i = 0; i < temp.length; i++){
            this.picSrc.push(temp[i]);
        }
    }
    
    onSelect(img: string): void {
        this.selPic.push(img);
        this.selectedPic = img;
    }
    
    unSelect(img: string): void{
        this.selPic.splice(this.selPic.indexOf(img),1);
        if (this.selPic.length == 0) this.selectedPic = null;
    }
    
    onDelete(): void {
        for (let i = 0; i < this.selPic.length; i++){
            this.picSrc.splice(this.picSrc.indexOf(this.selPic[i]),1);
        }
        this.selPic = [];
        this.selectedPic = null;
    }
    
    getPictures(): string[]{
        return this.picSrc;
    }
    
    getSelected(): string{
        return this.selectedPic;
    }
    
    getSel(): string[]{
        return this.selPic;
    }
}