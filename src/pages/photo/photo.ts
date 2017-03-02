import {Component} from '@angular/core';

import {NavController, NavParams} from 'ionic-angular';
import {ImagePicker, SocialSharing, ScreenOrientation} from 'ionic-native';
import {Platform} from 'ionic-angular';

import {ServerService} from '../util/server.service';
import {PhotoService} from '../util/photo.service';
import {AlbumService} from '../util/album.service';
import {OnePic} from '../onePic/onePic';
import {MenuPage} from '../menu/menu';
import {ConnectPage} from '../connect/connect';
import {User} from '../util/user';

@Component({
    selector: 'photo-home',
    templateUrl: 'photo.html'
})


export class PhotoPage {
    private albumId: string;
    private temp: string[] = [];
    private grid: string[][];
    private selectedMod: boolean = false;
    private state: string;
    private albumName: string;
    onePhoto = OnePic;
    menu = MenuPage;
    connectPage = ConnectPage;

    constructor(
        public navCtrl: NavController,
        private params: NavParams,
        public plt: Platform,
        private photoService: PhotoService,
        private serverService: ServerService,
        private albumService: AlbumService,
        private user: User) {
        this.albumId = params.get('albumId');
        this.albumName = params.get('albumTitle');
    }

    ionViewDidEnter() {
        if (!this.albumId) {
            alert("vous n'êtes pas connecté");
        }
    }

    /*
     * Permet à l'utilisateur de sélectionner photos.
     */
    private openGallery(): void {

        let pickerOptions = {
            maximumImagesCount: 10,
            outputType: 1
        }

        ImagePicker.getPictures(pickerOptions).then((results) => {
            this.photoService.addPictures(results);
            this.serverService.addPictures(this.photoService.getPictures(), 
                this.albumId).subscribe((result) =>{
                    console.log(result);
                    this.setupGrid();
                }, (err) =>{
                    console.log(err);
                });
            
        },
            (err) => {});
    }

    private editTitle(newValue) {
        if (this.user.token)
            this.serverService.editAlbums(this.albumId, newValue).subscribe((results) => {
                this.albumService.updateAlbum(this.albumId, this.albumName);
            });
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
        this.setState("select");
    }

    setSelectMod(): void {
        if (this.state == null || this.state == "select") {
            this.selectedMod = !this.selectedMod;
            if (!this.selectedMod) this.photoService.cleanSel();
            this.setState("select");
        }

    }

    setState(state: string) {
        if (this.state != null) {
            this.state = null;
        } else {
            this.state = state;
        }
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
    }

    getSquareSize() {
        return (this.plt.isPortrait() ? window.innerWidth / 4
            : window.innerWidth / 8);
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
        if (this.state == null || this.state == "print") {
            console.log("print");
            this.setState("print");
        }

    }

    toMenu(): void {
        this.navCtrl.push(this.menu, {albumId: this.albumId});
    }

    goRoot(): void {
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
}
