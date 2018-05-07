import {Injectable, OnInit} from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import { Observable } from 'rxjs';
import * as GeoFire from 'geofire';




@Injectable()
export class GeoService {


  constructor(private http: HttpClient, db: AngularFireDatabase) {

  }








}
