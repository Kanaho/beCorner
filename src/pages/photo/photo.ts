import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';
import {Camera, ImagePicker, File, SocialSharing, ScreenOrientation} from 'ionic-native';
import {Platform} from 'ionic-angular';

/*import * as Caman from 'caman';
import { canvas } from 'canvas';*/

import {PhotoService} from './album/photo.service';
import {OnePic} from './onePic/onePic';
import {MenuPage} from '../menu/menu';
import {ConnectPage} from '../connect/connect';
import {User} from '../connect/user/user';

declare var Caman: any;
declare var cordova: any;

@Component({
    selector: 'photo-home',
    templateUrl: 'photo.html'
})


export class PhotoPage {

    private temp: string[];
    private grid: string[][];
    private selectedMod: boolean = false;
    private albumName: string;
    onePhoto = OnePic;
    menu = MenuPage;
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
        if (this.selectedMod) {
            if (this.selected(img)) {
                this.photoService.unSelect(img);
            } else {
                this.photoService.onSelect(img);
            }
        } else {
            this.photoService.setSelected(img);
            this.navCtrl.push(this.onePhoto, {title: this.albumName},
                {animation: 'fade-transition', direction: 'forward'});
        }
    }

    onDelete(): void {
        this.photoService.onDelete();
        this.setupGrid();
    }
    
    setSelectMod(): void{
        this.selectedMod = !this.selectedMod;
        if (!this.selectedMod) this.photoService.cleanSel();
        //BrowserTest 
            this.setupGrid();
    }

    /*
     * Met toutes les photos dans un tableau, 
     *  suivant la disposition de l'appareil
     */
    setupGrid() {
        let rowNum = 0;
        let rowSize = (this.plt.isPortrait()) ? 4 : 8;
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

        ///BrowserTests
        /*for (let i = 0; i < 9; i += rowSize) {
            this.grid[rowNum] = [];
            for (let j = 0; j < rowSize; j++) {
                if(i+j <=9)
                    this.grid[rowNum][j] = this.myImage;
            }

            rowNum++;
        }*/
    }

    getSquareSize() {
        return (this.plt.isPortrait() ? window.innerWidth / 4
            : window.innerWidth / 8);
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

    print(): void {
        console.log("print");
    }
    
    toMenu(): void {
        this.navCtrl.push(this.menu);
    }

}
