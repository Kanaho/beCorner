import {Injectable} from '@angular/core';
import {Photo} from './photo';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class PhotoService {
    private pictures: Array<Photo> = [];
    private selectedPic: Photo;
    private selPic: Array<Photo> = [];

    addPictures(temp: Photo[]): void {
        for (let i = 0; i < temp.length; i++) {
            this.pictures.push(temp[i]);
        }
    }
    
    addOnePicture(temp: Photo): void {
        this.pictures.push(temp);
    }
    
    contain(imgId: string){
        return this.getImgById(imgId) != null;
    }
    
    setSelected(imgId: string): void {
        this.selectedPic = this.getImgById(imgId);
    }

    onSelect(imgId: string): void {
        this.selPic.push(this.getImgById(imgId));
    }

    cleanSel(): void {
        while (this.selPic.length > 0) {
            this.selPic.pop();
        }
    }

    unSelect(imgId: string): void {
        this.selPic.splice(this.selPic.indexOf(this.getImgById(imgId)), 1);
    }

    onDelete(): void {
        for (let i = 0; i < this.selPic.length; i++) {
            this.pictures.splice(this.pictures.indexOf(this.selPic[i]), 1);
        }
        this.selPic = [];
        this.selectedPic = null;
    }
    
    private getImgById(imgId: string){
        for (let i = 0; i < this.pictures.length; i++){
            if (this.pictures[i].idphoto == imgId) return this.pictures[i];
        }
        return null;
    }
    
    isSelected(id: string){
        for (let i = 0; i < this.selPic.length; i++){
            if (this.selPic[i].idphoto == id) return true;
        }
        return false;
    }
    
    pictureUp(id: string, source: string){
        let img = this.getImgById(id);
        if(img){
            img.status = 0;
            img.src = source; 
        }
    }

    getPictures(): Photo[] {
        return this.pictures;
    }

    getSelected(): Photo {
        return this.selectedPic;
    }

    getSel(): Photo[] {
        return this.selPic;
    }
    
    newService(){
        this.pictures.splice(0, this.pictures.length);
        this.onDelete();
    }
}