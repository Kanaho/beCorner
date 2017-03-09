import {Injectable} from '@angular/core';
import {Photo} from './photo';
import {User} from './user'
import {File, Transfer, FilePath} from 'ionic-native';
import {Platform} from 'ionic-angular';
import 'rxjs/add/operator/catch';

declare var cordova: any;

@Injectable()
export class UploadService {
    private lastImage: string;
    private imgId:number;

    constructor(private platform: Platform, private user: User) {
    }

    public preparePicture(picture: Photo): Promise<string>{
        /*if (this.platform.is('android')) {
            FilePath.resolveNativePath(picture.src).then(filePath => {
                let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                
                this.copyFileToLocalDir(correctPath, currentName, picture.name);
                return Promise.resolve("prepared");
            }, (err) => {
                return Promise.reject(err);
            })
        } else {
            var currentName = picture.src.substr(picture.src.lastIndexOf('/') + 1);
            var correctPath = picture.src.substr(0, picture.src.lastIndexOf('/') + 1);
            this.copyFileToLocalDir(correctPath, currentName, picture.name);
            return Promise.resolve("prepared");
        }*/
        let currentName = picture.src.substring(picture.src.lastIndexOf('/') + 1);
        let path = picture.src.substr(0, picture.src.lastIndexOf('/') + 1);
        this.imgId = picture.idphoto;
        this.lastImage=picture.src;
        //this.copyFileToLocalDir(path, currentName, picture.name);
        return Promise.resolve("prepared");
    }
    
    private copyFileToLocalDir(namePath, currentName, newFileName) {
        File.copyFile(namePath, currentName, cordova.file.cacheDirectory, newFileName).then(success => {
            this.lastImage = newFileName;
            console.log("stored " + JSON.stringify(success));
        }, (err) => {
            console.log('Error while storing file.' + JSON.stringify(err));
        });
    }

    private pathForImage(img) {
        if (img === null) {
            return '';
        } else {
            return cordova.file.dataDirectory + img;
        }
    }

    public uploadImage(albumId: number, imgId: number, filename: string) {
        var url = "http://api.becorner.dev/upload/upload";
        //var targetPath = this.pathForImage(this.lastImage);
        var filename = this.lastImage;

        var options = {
            fileKey: "qqfile",
            fileName: filename,
            mimeType: "image/jpeg",
            params: {'fileName': filename, 'idphoto': imgId, 'idalbum': albumId},
            headers: {Authorization: this.user.token}
        };

        const fileTransfer = new Transfer();

        fileTransfer.upload(filename, url, options).then(data => {
            console.log("upload done" + JSON.stringify(data));
        }, (err) => {
            console.log("upload failed" + JSON.stringify(err));
        });
    }

}