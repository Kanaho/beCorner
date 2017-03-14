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
import {ActionType} from '../util/action';

@Component({
    selector: 'photo-home',
    templateUrl: 'photo.html'
})


export class PhotoPage {
    private album: Album;
    private previousId: number;
    private initTitle: string;
    private temp: Array<Photo> = [];
    private grid: Photo[][];
    private selectedMod: boolean = false;
    private state: string;
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
        this.album = params.get('album');
        this.handleSocket();
        this.handleNetwork();
    }

    ionViewDidEnter() {
        this.initTitle = this.album.title;
        console.log(this.album.id);
        if (this.album.id != this.previousId) {
            this.previousId = this.album.id;
            this.photoService.newService();
            if (Network.type != "none") {
                this.requestPicture();
            } else {
                this.getPictures();
            }
        }
    }

    ionViewWillLeave() {
        if (this.initTitle != this.album.title) this.editTitle(this.album.title);
        //Unsubscribe le dernier observer, à savoir celui-ci
        this.socket.socketObserver[this.socket.socketObserver.length-1].unsubscribe();
    }

    private requestPicture() {
        this.serverService.getPictures(this.album.id).subscribe((response) => {
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
        this.storage.getPictures(this.album.id).then((pictures) => {
            console.log("found");
            for (let pic of pictures) {
                let photo = {
                    idphoto: pic.idphoto,
                    name: pic.name,
                    src: pic.src,
                    status: pic.status
                }
                console.log(photo.idphoto);
                this.photoService.addOnePicture(photo);
            }
            this.setupGrid();
        }, (err) => {
            if (err.code == 2 && this.album.id >0) alert("Impossible de charger les photos existantes");
            console.log("getPictures " + JSON.stringify(err));
        });
    }

    private handleSocket() {
        this.socket.socketService.subscribe(event => {
            if (event.category === 'thumbnail') {
                console.log("Thumbnail Photo");
                let jsonString = JSON.stringify(event.message);
                let jsonObject = JSON.parse(jsonString);
                this.photoService.pictureUp(jsonObject.idphoto, "http://api.becorner.dev" +jsonObject.src);
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
            this.album.id).subscribe((response) => {
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
                    this.serverService.uploadPicture(pic, this.album.id);
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
                idphoto: -Date.now(),
                name: source,
                src: source,
                status: null
            };
            console.log(pic.idphoto);
            this.photoService.addOnePicture(pic);
            pictures.push(pic);
        }
        //this.storage.storePictures(pictures, this.album.id);
        this.storage.storeAction(this.album, ActionType.Add, pictures);
        this.setupGrid();
    }

    private editTitle(newValue) {
        if (Network.type != "none") {
            if (this.user.token)
                this.serverService.editAlbums(this.album.id, newValue).subscribe((results) => {
                    this.albumService.updateAlbum(this.album.id, this.album.title);
                }, (err) => {
                    console.log("Cannot rename : " + JSON.stringify(err));
                });
        } else {
            //this.storage.editAlbum(this.album.id, newValue);
            this.storage.storeAction(this.album, ActionType.Rename, []);
        }

    }

    selected(imgId: number): boolean {
        return this.photoService.isSelected(imgId);
    }

    onSelect(imgId: number): void {
        if (this.selectedMod) {
            if (this.selected(imgId)) {
                this.photoService.unSelect(imgId);
            } else {
                this.photoService.onSelect(imgId);
            }
        } else {
            this.photoService.setSelected(imgId);
            if (!this.photoService.getSelected().status)
                this.navCtrl.push(this.onePic, {title: this.album.id},
                    {animation: 'fade-transition', direction: 'forward'});
        }
    }

    onDelete(): void {
        let tempId: number[] = [];
        for (let pic of this.photoService.getSel()) {
            console.log("Sel :" + pic.idphoto);
            tempId.push(pic.idphoto);
        }
        Network.type != "none" ? this.serverDelete(tempId) : this.storageDelete(tempId);
        this.photoService.onDelete();
        this.setupGrid();
    }

    private serverDelete(tempId: number[]) {
        this.serverService.deletePictures(tempId, this.album.id).subscribe((response) => {

        })
    }

    private storageDelete(tempId: number[]) {
        //this.storage.deletePictures(this.album.id, tempId).then((result) => {});
        this.storage.storeAction(this.album, ActionType.Delete, this.photoService.getSel());
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

    share(): void {
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
        this.navCtrl.push(this.menu, {album: this.album});
    }

    goRoot(): void {
        this.navCtrl.popToRoot({animation: 'fade-transition', direction: 'forward'});
    }
}
