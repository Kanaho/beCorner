import {Component} from '@angular/core';

import {NavController, NavParams} from 'ionic-angular';
import {ImagePicker, SocialSharing, ScreenOrientation} from 'ionic-native';
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
    private albumId: string;
    private temp: string[] = [];
    private grid: string[][];
    private selectedMod: boolean = false;
    private albumName: string;
    onePhoto = OnePic;
    menu = MenuPage;
    connectPage = ConnectPage;

    private myImage: string = "http://www.w3schools.com/images/w3schools_green.jpg";

    constructor(
        public navCtrl: NavController,
        private params: NavParams,
        public plt: Platform,
        private photoService: PhotoService,
        private user: User) {
        //ScreenOrientation.lockOrientation('portrait');
        this.albumId = params.get('albumId');
    }

    private openGallery(): void {

        let pickerOptions = {
            quality: 100,
            maximumImagesCount: 10,
        }

        ImagePicker.getPictures(pickerOptions).then((results) => {
            this.photoService.addPictures(results);
            this.setupGrid();
        },
            (err) => {});
    }

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

    setSelectMod(): void {
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
        SocialSharing.share("Regarde moi cet album : beCorner://home", null,
            null, null).then(() => {
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

    goRoot(): void {
        console.log('toRoot');
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
}
