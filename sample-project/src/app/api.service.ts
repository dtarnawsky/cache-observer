import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CacheObserver, CacheOptions } from 'rx-cache-observer';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public strategy: CacheOptions;

  constructor(private httpClient: HttpClient) { }

  public getJoke(): Observable<any> {
    const url = 'https://api.chucknorris.io/jokes/random';
    return CacheObserver(url, this.httpClient.get(url), this.strategy);
  }

  public getPerson(id): Observable<any> {
    const url = 'https://www.swapi.tech/api/people/';
    return CacheObserver(url, this.httpClient.get(url+id), this.strategy);
  }
}
