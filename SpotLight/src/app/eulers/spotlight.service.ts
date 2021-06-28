import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DMX {
  yaw: number;
  pitch: number;
  lum: number;
  color: number;
  strobe: number;
  gobo: number;
}

@Injectable({
  providedIn: 'root',
})
export class SpotlightService {
  constructor(private http: HttpClient) {
    this.initializeSpotlight()
  }

  initializeSpotlight(): Observable<any> {
    return this.http.get('http://localhost:5000/api/init');
  }

  testSpotlight(dmxObject: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/move', dmxObject);
  }
}