import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DMX {
  x: number;
  y: number;
  lum: number;
  color: number;
  strobe: number;
  gobo: number;
}

export interface CONFIG {
  x: number;
  y: number;
  height: number;
  spotlightOffset: string;
}

@Injectable({
  providedIn: 'root',
})
export class SpotlightService {
  constructor(private http: HttpClient) { }

  initializeSpotlight(id:number, camCon: CONFIG): Observable<any> {
    return this.http.post(`http://localhost:5000/api/initialize/${id}`, camCon);
  }

  testSpotlight(dmxObject: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/move/1', dmxObject);
  }
}