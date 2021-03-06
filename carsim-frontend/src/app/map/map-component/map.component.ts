import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AccountService} from '../../service/account.service';
import {Account} from '../../model/account';
import {Trip} from '../../model/trip';

declare var ol: any;

@Component({
  selector: 'app-map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public account: Account | null;
  private setTimeoutId: number;
  private markerVectorLayer: any;

  pick = {
    latitudeFrom: null,
    longitudeFrom: null,
    latitudeTo: null,
    longitudeTo: null,
    pickValFrom: false,
    pickValTo: false,
    markerVectorLayerFrom: null,
    markerVectorLayerTo: null
  };


  latitude = 18.5204;
  longitude = 73.8567;

  constructor(private activatedRouter: ActivatedRoute,
              private accountService: AccountService,
              private router: Router) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.activatedRouter.paramMap.subscribe(requestParameter => {

        const accountId = requestParameter.get('id');
        this.accountService.getAccount(requestParameter.get('id') || null).then((account: Account | null) => {
          this.account = account;
          if (account.tripId) {
            this.router.navigateByUrl(`/map/${accountId}/trips/${account.tripId}`);
          }
        });


      })
    );

    const mousePositionControl = new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(4),
      projection: 'EPSG:4326',
      // comment the following two lines to have the mouse position
      // be placed within the map.
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });

    this.accountService.map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }).extend([mousePositionControl]),
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([30.312159061431885, 59.932097364508536]),
        zoom: 8
      })
    });

    const map = this.accountService.map;
    const pick = this.pick;
    this.accountService.map.on('click', function (args) {
      console.log(args.coordinate);
      const lonlat = ol.proj.transform(args.coordinate, 'EPSG:3857', 'EPSG:4326');
      console.log(lonlat);

      if (pick.pickValFrom || pick.pickValTo) {

        const marker = new ol.Feature({
          geometry: new ol.geom.Point(
            ol.proj.fromLonLat([lonlat[0], lonlat[1]])
          ),  // Cordinates of New York's Town Hall
        });

        if (marker) {

          marker.setStyle(new ol.style.Style({
            image: new ol.style.Icon(({
              color: pick.pickValFrom ? '#ff4444' : '#44ff44',
              crossOrigin: 'anonymous',
              src: 'https://cdn-images-1.medium.com/max/600/1*SQI_HuavHth418JorokW1Q.png'
            }))
          }));

          if (pick.pickValFrom) {
            pick.latitudeFrom = lonlat[1];
            pick.longitudeFrom = lonlat[0];
          } else {
            pick.latitudeTo = lonlat[1];
            pick.longitudeTo = lonlat[0];
          }

          const vectorSource = new ol.source.Vector({
            features: [marker]
          });

          const markerVectorLayer = new ol.layer.Vector({
            source: vectorSource,
          });

          if (pick.pickValFrom) {
            if (pick.markerVectorLayerFrom !== null) {
              map.removeLayer(pick.markerVectorLayerFrom);
            }
            pick.markerVectorLayerFrom = markerVectorLayer;
          } else {
            if (pick.markerVectorLayerTo !== null) {
              map.removeLayer(pick.markerVectorLayerTo);
            }
            pick.markerVectorLayerTo = markerVectorLayer;
          }

          map.addLayer(markerVectorLayer);
        }
      }
      // const lon = lonlat[0];
      // const lat = lonlat[1];
      // alert(`lat: ${lat} long: ${lon}`);
    });


  }

  setCenter() {
    const view = this.accountService.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude]));
    view.setZoom(8);
  }

  pickFrom() {
    if (!this.pick.pickValFrom && this.pick.pickValTo) {
      this.pick.pickValTo = false;
    }
    this.pick.pickValFrom = !this.pick.pickValFrom;
  }

  pickTo() {
    if (!this.pick.pickValTo && this.pick.pickValFrom) {
      this.pick.pickValFrom = false;
    }
    this.pick.pickValTo = !this.pick.pickValTo;
  }

  drive() {
    this.accountService.drive(this.account, this.pick).subscribe((trip: Trip) => {
      console.log('Created trip ' + trip.trip_id);
      if (trip.trip_id) {
        this.account.tripId = trip.trip_id;
        this.accountService.account = this.account;

        this.setTimeoutId = setInterval(() => {
          this.accountService.getTrip(this.accountService.account.id, trip.trip_id).then((trip2: Trip | null) => {
            if (trip2 && trip2.transp_location) {
              const marker = new ol.Feature({
                geometry: new ol.geom.Point(
                  ol.proj.fromLonLat([trip2.transp_location.longitude, trip2.transp_location.latitude])
                ),  // Cordinates of New York's Town Hall
              });

              marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(({
                  color: '#4444ff',
                  crossOrigin: 'anonymous',
                  src: 'https://cdn-images-1.medium.com/max/600/1*SQI_HuavHth418JorokW1Q.png'
                }))
              }));

              const vectorSource = new ol.source.Vector({
                features: [marker]
              });

              const markerVectorLayer = new ol.layer.Vector({
                source: vectorSource,
              });


              if (this.markerVectorLayer !== null) {
                this.accountService.map.removeLayer(this.markerVectorLayer);
              }

              this.markerVectorLayer = markerVectorLayer;

              this.accountService.map.addLayer(markerVectorLayer);
            }
          });
        }, 1000);
      }
    }, (error) => {
      console.log(error);
    });
  }

  ngOnDestroy(): void {
    if (this.markerVectorLayer !== null) {
      this.accountService.map.removeLayer(this.markerVectorLayer);
    }
    clearInterval(this.setTimeoutId);
  }

}
