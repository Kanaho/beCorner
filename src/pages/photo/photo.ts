import {Component} from '@angular/core';

import {NavController, NavParams} from 'ionic-angular';
import {ImagePicker, SocialSharing, Network} from 'ionic-native';
import {Platform} from 'ionic-angular';

import {SocketService} from '../util/socket.service';
import {StorageService} from '../util/storage.service';
import {ServerService} from '../util/server.service';
import {PhotoService} from '../util/photo.service';
import {AlbumService} from '../util/album.service';
import {OnePic} from '../onePic/onePic';
import {MenuPage} from '../menu/menu';
import {ConnectPage} from '../connect/connect';
import {User} from '../util/user';
import {Photo} from '../util/photo';

@Component({
    selector: 'photo-home',
    templateUrl: 'photo.html'
})


export class PhotoPage {
    private albumId: string;
    private previousId: string;
    private temp: Array<Photo> = [];
    private grid: Photo[][];
    private selectedMod: boolean = false;
    private state: string;
    private albumName: string;
    onePic = OnePic;
    menu = MenuPage;
    connectPage = ConnectPage;

    constructor(
        public navCtrl: NavController,
        private params: NavParams,
        public plt: Platform,
        private photoService: PhotoService,
        private serverService: ServerService,
        private albumService: AlbumService,
        private user: User,
        private socket: SocketService,
        private storage: StorageService) {
        this.previousId = null;
        this.albumId = params.get('albumId');
        this.albumName = params.get('albumTitle');
        this.handleSocket();
        this.handleNetwork();
        console.log(this.albumId);
    }

    ionViewDidEnter() {
        if (this.albumId != this.previousId){
            this.previousId = this.albumId;
            this.photoService.newService();
            if (Network.type != "none") {
                this.requestPicture();
            } else {
                this.getPictures();
            }
        }
    }
    
    private requestPicture() {
        this.serverService.getPictures(this.albumId).subscribe((response) => {
            let jsonString = JSON.stringify(response);
            let jsonResponse = JSON.parse(jsonString);
            let jsonObject = JSON.parse(jsonResponse._body);
            for (let object of jsonObject.photos) {
                if (!this.photoService.contain(object.idphoto)) {
                    let source;
                    if (object.uploading == 1) {
                        //Si la photo n'est pas encore up
                        source = "./img/logo.jpg";
                    } else {
                        source = "http://api.becorner.dev" + object.src;
                    }
                    let pic = {
                        idphoto: object.idphoto,
                        name: object.photoName,
                        src: source,
                        status: object.uploading //L'état de la photo sur le serveur
                    };
                    this.storage.existPic(pic);
                    this.photoService.addOnePicture(pic);
                }
            }
            this.setupGrid();
        })
    }

    private getPictures() {
        //Recupere les photos du storage si hors-ligne.
        this.storage.getPictures(this.albumId).then((pictures) => {
            for (let pic of pictures) {
                let photo = {
                    idphoto: Date.now().toString(),
                    name: "Name",
                    src: pic.src,
                    status: 1
                }
                this.photoService.addOnePicture(photo);
            }
            this.setupGrid();
        }, (err) =>{
            if(err.code == 2)alert("Impossible de charger les photos existantes");
            console.log("getPictures " + JSON.stringify(err));
        });
    }

    private handleSocket() {
        this.socket.socketService.subscribe(event => {
            console.log('from serveur..', event);
            if (event.category === 'thumbnail') {
                let jsonString = JSON.stringify(event.message);
                let jsonObject = JSON.parse(jsonString);
                this.photoService.pictureUp(jsonObject.idphoto, jsonObject.src);
            }
        });
    }

    private handleNetwork() {
        let connectSub = Network.onConnect().subscribe(() => {
            console.log("connected");
        }, () => {
            console.log("disonnected");
        })
        let disconnectSub = Network.onDisconnect().subscribe(() => {
            console.log(Network.type);
        }, () => {
            console.log("err");
        })
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
            if (Network.type != "none") {
                this.addPictureOnline(results);
            } else {
                this.addPictureOffline(results);
            }
        },
            (err) => {console.log(err)}
        );
    }

    private addPictureOnline(results: any) {
        let result = results;
        this.serverService.addPictures(results,
            this.albumId).subscribe((response) => {
                let jsonString = JSON.stringify(response);
                let jsonResponse = JSON.parse(jsonString);
                let jsonObject = JSON.parse(jsonResponse._body);
                let i = 0;
                for (let object of jsonObject.photos) {
                    let pic: Photo = {
                        idphoto: object.idphoto,
                        name: object.name,
                        src: result[i],
                        status: null
                    };
                    this.photoService.addOnePicture(pic);
                    this.serverService.uploadPicture(pic, this.albumId);
                    i++;
                }
                this.setupGrid();
            }, (err) => {
                console.log(err);
            });
    }

    private addPictureOffline(results: any) {
        let pictures: Photo[] = [];
        for (let source of results) {
            let pic: Photo = {
                idphoto: null,
                name: null,
                src: source,
                status: null
            };
            this.photoService.addOnePicture(pic);
            pictures.push(pic);
        }
        this.storage.storePictures(pictures, this.albumId);
        this.setupGrid();
    }

    private editTitle(newValue) {
        if (this.user.token)
            this.serverService.editAlbums(this.albumId, newValue).subscribe((results) => {
                this.albumService.updateAlbum(this.albumId, this.albumName);
            });
    }

    selected(imgId: string): boolean {
        return this.photoService.isSelected(imgId);
    }

    onSelect(imgId: string): void {
        if (this.selectedMod) {
            if (this.selected(imgId)) {
                this.photoService.unSelect(imgId);
            } else {
                this.photoService.onSelect(imgId);
            }
        } else {
            this.photoService.setSelected(imgId);
            if (!this.photoService.getSelected().status)
                this.navCtrl.push(this.onePic, {title: this.albumName},
                    {animation: 'fade-transition', direction: 'forward'});
        }
    }

    onDelete(): void {
        let tempId: string[] = [];
        for (let pic of this.photoService.getSel()) {
            tempId.push(pic.idphoto);
        }
        this.serverService.deletePictures(tempId, this.albumId).subscribe((response) => {
            this.photoService.onDelete();
            this.setupGrid();
            this.setState("delete");
        })

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
