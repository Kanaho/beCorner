import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';
import {Camera, ImagePicker, File, SocialSharing} from 'ionic-native';
import {Platform} from 'ionic-angular';

/*import * as Caman from 'caman';
import { canvas } from 'canvas';*/

import {PhotoService} from './album/photo.service';
import {EditPhoto} from './editPhoto/editPhoto';
import {ConnectPage} from '../connect/connect';
import {User} from '../connect/user/user';

declare var Caman: any;
declare var cordova: any;

@Component({
    selector: 'page-home',
    templateUrl: 'photo.html'
})


export class PhotoPage {

    private temp: string[];
    private grid: string[][];
    editPhoto = EditPhoto;
    connectPage = ConnectPage;

    private myImage: string = "http://www.w3schools.com/images/w3schools_green.jpg";

    constructor(
        public navCtrl: NavController,
        public plt: Platform,
        private photoService: PhotoService,
        private user: User) {
    }

    private openGallery(): void {

        let pickerOptions = {
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.DATA_URL,
            quality: 100,
            maximumImagesCount: 10,
        }

        ImagePicker.getPictures(pickerOptions).then((results) => {
            this.photoService.addPictures(results);
            //this.addPictures();
            this.setupGrid();
        },
            (err) => {});

        /*let cameraOptions = {
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.DATA_URL,
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation: true
        }
        
        Camera.getPicture(cameraOptions).then(function(imageData){
            
            onImageSuccess(imageData);
            
            function onImageSuccess(fileURI){
                createFileEntry(fileURI);
            }
            
            function createFileEntry(fileURI){
                File.resolveLocalFilesystemUrl(fileURI).then(function(fileEntry){
                    copyFile(fileEntry);
                }), fail();
            }
            
            function copyFile(fileEntry){
                let name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/')+1);
                let newName = makeid() + name;
                
                File.resolveLocalFilesystemUrl(cordova.file.dataDirectory)
                    .then(function(fileSystem2){
                        fileEntry.copyTo(
                            fileSystem2,
                            newName,
                        ).then((copySucces) =>{
                            console.log(copySucces)
                        });
                }), fail();
            }
            
            function makeid(){
                let text = "";
                var possible = "ABCDEDJZIQMZIOPQMZQdzadadza1234567890";
                
                for(var i=0; i<5; i++){
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }
            function fail(){
                console.log('fail');
            }
        });*/
    }

    /*addPictures() {
        this.photoService.addPictures(this.temp);
    }*/

    selected(img: string): boolean {
        return this.photoService.getSel().indexOf(img) >= 0;
    }

    onSelect(img: string): void {
        if (this.selected(img)) {
            this.photoService.unSelect(img);
        } else {
            this.photoService.onSelect(img);
        }

    }

    onDelete(): void {
        this.photoService.onDelete();
        this.setupGrid();
    }

    setupGrid() {
        let rowNum = 0;
        let rowSize = (this.plt.isPortrait()) ? 2 : 4;
        this.grid = [];
        this.temp = this.photoService.getPictures();
        for (let i = 0; i < this.temp.length; i += rowSize) {
            this.grid[rowNum] = [];
            for (let j = 0; j < rowSize; j++) {
                if (this.temp[i + j])
                    this.grid[rowNum][j] = this.temp[i + j];
            }

            rowNum++;
        }
    }

    getSquareSize() {
        let size;
        return size = (this.plt.isPortrait() ? window.innerWidth / 2
            : window.innerWidth / 4);
    }

    private addFilter() {
        console.log('AddFilter');
        Caman('#image', function () {
            /*this.resize({
                width: 500,
                height: 300
            });*/

            this.sunrise();
            this.render();

            //this.brightness(10).render();
            /*this.contrast(30);
            this.sepia(60);
            this.saturation(-30);
            this.render();*/
            console.log('Filter Applied');
        })
    }
    upload(): void {
        SocialSharing.share("Envoyé depuis BeCorner", null,
            this.photoService.getSel(), null).then(() => {
                console.log("Share done");
            }, () => {
                console.log("Share cancelled");
            })
    } 
}
