import { Injectable } from '@angular/core';
import { Jsonp, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class WikiService{
    constructor(private jsonp: Jsonp){}
    
    search(term: string){
        
        let wikiurl = 'http://en.wikipedia.org/w/api.php'
        
        let params = new URLSearchParams();
        params.set('search', term);
        params.set('action', 'opensearch');
        params.set('format', 'json');
        params.set('callback', 'JSONP_CALLBACK');
        
        return this.jsonp
            .get(wikiurl, {search: params})
            .map(response => <string[]> response.json()[1]);
    }
}
