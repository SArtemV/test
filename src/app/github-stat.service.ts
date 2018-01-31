import {map} from 'lodash';
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


@Injectable()
export class GithubStatService {

    private searchUsersEndPoint = "https://api.github.com/repos/angular/angular/commits?client_id=c45417c5d6249959a91d&client_secret=3630a057d4ebbbdbfc84f855376f3f46f58b9710&since=2017-01-30T12:06:30Z&per_page=100";

    constructor(private http: Http) {
    }

    getUsersByPlaceAndLanguage(author: string, page: number) {
        let url = this.searchUsersEndPoint + '&page=' + page + '&author=' + author;

        return this.http.get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }


    private extractData(res: Response) {
        let body = res.json();
        body = map(body, function (commit: any) {
            return {
                "sha": commit.sha,
                "date": commit.commit.author.date,
                'monthNumber': (new Date(commit.commit.author.date)).getMonth(),
                'month': GithubStatService.getMonthNameByNumber((new Date(commit.commit.author.date)).getMonth())
            }
        });
        return body;
    }

    private handleError(error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    public static getMonthNameByNumber(monthNumber: number) {
        let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return (monthNumber >= 0 && monthNumber <= 11) ? monthNames[monthNumber] : 'not set';
    }
}
