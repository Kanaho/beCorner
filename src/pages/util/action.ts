import {Photo} from './Photo';

export interface Action {
    action: ActionType; //Vrai si ajout et Faux si suppression
    album: Album;
    pictures: Photo[];
}

export enum ActionType{
    Add,
    Delete,
    Rename,
    Create
}


