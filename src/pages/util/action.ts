import {Photo} from './Photo';

export interface Action {
    action: ActionType; //Vrai si ajout et Faux si suppression
    album: Album;
    pictures: Photo[];
}

export enum ActionType{
    Add, //Ajout de photo
    Delete, //Suppression de photo
    Rename, //Edition du nom d'Album
    Create, //Création d'Album
    Remove //Suppression d'Album
}


