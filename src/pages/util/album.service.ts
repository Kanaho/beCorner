import {Injectable} from '@angular/core';


@Injectable()
export class AlbumService {
    private myAlbums: Array<Album> = [];
    
    constructor() {}
    
    getAlbums(){
        return this.myAlbums;
    }
    
    addAlbum(album: Album){
        this.myAlbums.push(album);
    }
    
    deleteAlbum(id: string){
        let alb = this.findAlbum(id);
        this.myAlbums.splice(this.myAlbums.indexOf(alb),1);
    }
    
    clearAll(){
        this.myAlbums.splice(0, this.myAlbums.length);
    }
    
    updateAlbum(id: string, title: string){
        let alb = this.findAlbum(id);
        alb.title = title;
    }
    
    private findAlbum(id: string){
        for(let alb of this.myAlbums){
            if (alb.id == id)
                return alb;
        }
    }
}