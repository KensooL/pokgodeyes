import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { } from '@types/googlemaps';
declare var google: any;
declare var GeoFire: any;
import * as _ from 'lodash';
import {environement} from './environement/environnement';
import {ParkopolyService} from './providers/parkopoly';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
declare var firebase: any;
const driversInQuery = {};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {

  concessionRef: AngularFireObject<any>;
  drivers: Observable<any[]>;
  concessions: Observable<any[]>;
  myControl: FormControl;
  filtereddrivers: Observable<string[]>;
  geoFire: any;
  geoQuery: any;
  driver = new Map()



  constructor(private parkopolyService: ParkopolyService, private db: AngularFireDatabase) {
    this.drivers = db.list('drivers').valueChanges();
    this.concessions = db.list('concessions').valueChanges();
    this.myControl = new FormControl();
    this.geoFire  = new GeoFire(this.db.list('geofire').query.ref);

    this.geoQuery = this.geoFire.query({
      center: [48.841169, 2.296801],
      radius: 10.5
    });




  }

  @ViewChild('gmap') gmapElement: ElementRef;
  map: google.maps.Map;
  radiusInKm: 4.5;
  database: any;
  geoFire: any;
  AllData: Array<Object>;


  ngOnInit(): void {

    this.filtereddrivers = this.myControl.valueChanges.pipe( startWith<string>(''),  map(val => this.filter(val)));

  }

  filter(val: string): string[] {
    console.log('this is my val' + ' ' + val);

  }

  updateValue(concessionid: string, value: object) {
    this.concessionRef = this.db.object('consessions/' + concessionid);
  }

  /* Returns true if the two inputted coordinates are approximately equivalent */
  coordinatesAreEquivalent(coord1, coord2) {
    return (Math.abs(coord1 - coord2) < 0.000001);
  }


  addmarker(location, name) {
    new google.maps.Marker({
      position: location,
      map: this.map,
      title: name,
      optimized: true,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/bus.png',
        scaledSize: new google.maps.Size(30, 30), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0)
      },
      label: {
        text: name,
        color: '#FF8C00',
        fontSize: '10px',
        fontWeight: 'bold'
      }
    });
  }


  addDriverMarker(location, name) {
    var marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: name,
      optimized: true,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/hiker.png',
        scaledSize: new google.maps.Size(30, 30), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0)
      },
      label: {
        text: name,
        color: '#FF8C00',
        fontSize: '10px',
        fontWeight: 'bold'
      }
    });

    return marker;
  }

  onDriverlocation(key: string) {
    this.geoFire.set('5a2990d1e4b0dbf776740eaf', [48.841169, 2.2976]).then(function() {
      console.log('Provided key has been added to GeoFire');
    }).catch(function(e) {
      console.log(JSON.stringify(e));
    });
  }





  ngAfterViewInit(): void {

    this.map = new google.maps.Map(this.gmapElement.nativeElement, {
      center: {lat:  48.841169, lng: 2.296801},
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });


    const circle = new google.maps.Circle({
      strokeColor: '#6D3099',
      strokeOpacity: 0.7,
      strokeWeight: 1,
      fillColor: '#B650FF',
      fillOpacity: 0.35,
      map: this.map,
      center: {lat:  48.841169, lng: 2.296801},
      radius: ((this.radiusInKm) * 1000),
      draggable: true
    });

    //Update the query's criteria every time the circle is dragged


    const updateCriteria = _.debounce(function() {
      const latLng = circle.getCenter();
      this.geoQuery.updateCriteria({
        center: [latLng.lat(), latLng.lng()],
        radius: this.radiusInKm
      });
    }, 10);






    google.maps.event.addListener(circle, 'drag', updateCriteria);

    this.concessions.subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        this.addmarker(res[i].locationDto, res[i].name);
      }



    });



    this.geoQuery.on('ready', () => {
      console.log('GeoQuery has loaded and fired all other events for initial data');
    });

    this.geoQuery.on('key_entered', (key, location, distance) => {
      driversInQuery[key] = true;
      // this.addDriverMarker(location, "prince")

      this.db.list('drivers', ref => ref.orderByKey().equalTo(key)).valueChanges().subscribe(res =>{
        this.driver.set(key, this.addDriverMarker(new google.maps.LatLng(location[0], location[1]),  res[0].login));

      })


      console.log(key + ' entered query at ' + location + ' (' + distance + ' km from center)');
    });


    this.geoQuery.on('key_exited', (key, location, distance) => {
      console.log(key + ' exited query to ' + location + ' (' + distance + ' km from center)');
    });

    this.geoQuery.on('key_moved', (key, location, distance) => {
      console.log(JSON.stringify('j\'aibouge'));
      const marker = this.driver.get(key);
      marker.animatedMoveTo(location, marker);

    });





    /* Animates the Marker class (based on https://stackoverflow.com/a/10906464) */
    google.maps.Marker.prototype.animatedMoveTo = (newLocation, marker) => {
      const toLat = newLocation[0];
      const toLng = newLocation[1];

      const fromLat = marker.getPosition().lat();
      const fromLng = marker.getPosition().lng();


      if (!this.coordinatesAreEquivalent(fromLat, toLat) || !this.coordinatesAreEquivalent(fromLng, toLng)) {
        let percent = 0;
        const latDistance = toLat - fromLat;
        const lngDistance = toLng - fromLng;
        const interval = window.setInterval(() => {
          percent += 0.01;
          const curLat = fromLat + (percent * latDistance);
          const curLng = fromLng + (percent * lngDistance);
          const pos = new google.maps.LatLng(curLat, curLng);
          marker.setPosition(pos);
          if (percent >= 1) {
            window.clearInterval(interval);
          }
        }, 50);
      }
    };



  }









}
