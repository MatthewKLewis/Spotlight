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
  cameraOffset: string;
}

@Injectable({
  providedIn: 'root',
})
export class SpotlightService {
  constructor(private http: HttpClient) {
    this.initializeSpotlight()
  }

  initializeSpotlight(): Observable<any> {
    return this.http.post('http://localhost:5000/api/init', 
    { //Camera Config Object
      height: 300,
      x: 315,
      y: 495,
      cameraOffset: '0'
    });
  }

  testSpotlight(dmxObject: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/move', dmxObject);
  }
}