import { Component, OnDestroy, OnInit, } from '@angular/core';
import { Platform }                      from '@ionic/angular';
import { Geolocation }                   from '@ionic-native/geolocation/ngx';
import { Subject }                       from 'rxjs';
import { takeUntil }                     from 'rxjs/operators';
import IOrder                            from '@modules/server.common/interfaces/IOrder';
import CarrierStatus                     from '@modules/server.common/enums/CarrierStatus';
import GeoLocation                       from '@modules/server.common/entities/GeoLocation';
import { CommonUtils }                   from '@modules/server.common/utilities';
import { CarrierRouter }                 from '@modules/client.common.angular2/routers/carrier-router.service';
import { StorageService }                from '../../services/storage.service';
import { GeoLocationService }            from '../../services/geo-location.service';
import { environment }                   from '../../environments/environment';

@Component({
	           selector:    'page-main',
	           templateUrl: 'main.html',
	           styleUrls:   ['main.scss'],
           })
export class MainPage implements OnInit, OnDestroy
{
	public selectedOrder: IOrder;
	public isTakenFromAnotherCarrier: boolean = false;
	private isOnline: boolean;
	private destroy$ = new Subject<void>();
	
	constructor(
			private platform: Platform,
			private carrierRouter: CarrierRouter,
			private geolocation: Geolocation,
			private geoLocationService: GeoLocationService,
			private storageService: StorageService
	)
	{}
	
	public ngOnInit(): void
	{
		this.platform.ready()
		    .then(() =>
		          {
			          console.warn('MainPage Loaded');
			          this.watchLocation();
			          this.watchOrderStatus();
		          });
	}
	
	public ngOnDestroy(): void
	{
		this.destroy$.next();
		this.destroy$.complete();
	}
	
	public watchLocation()
	{
		setInterval(() =>
		            {
			            if(this.isOnline && this.storageService.carrierId)
			            {
				            const carrier$ = this.carrierRouter
				                                 .get(this.storageService.carrierId)
				                                 .pipe(takeUntil(this.destroy$))
				                                 .subscribe(async(carrier) =>
				                                            {
					                                            if(carrier.status === CarrierStatus.Online)
					                                            {
						                                            this.geolocation
						                                                .getCurrentPosition()
						                                                .then((position) =>
						                                                      {
							                                                      const carrierLong =
									                                                            carrier.geoLocation.coordinates.lng;
							                                                      const carrierLat =
									                                                            carrier.geoLocation.coordinates.lat;
							
							                                                      const currentLong =
									                                                            position.coords.longitude;
							                                                      const currentLat = position.coords.latitude;
							
							                                                      if(
									                                                      carrierLong !== currentLong ||
									                                                      carrierLat !== currentLat
							                                                      )
							                                                      {
								                                                      this.carrierRouter
								                                                          .updateGeoLocation(
										                                                          carrier.id,
										                                                          new GeoLocation({
											                                                                          _createdAt: new Date().toString(),
											                                                                          _updatedAt: new Date().toString(),
											                                                                          _id:        CommonUtils
													                                                                                      .generateObjectIdString(),
											                                                                          city:
											                                                                                      carrier.geoLocation
													                                                                                      .city,
											                                                                          countryId:
											                                                                                      carrier.geoLocation
													                                                                                      .countryId,
											                                                                          streetAddress:
											                                                                                      carrier.geoLocation
													                                                                                      .streetAddress,
											                                                                          house:
											                                                                                      carrier.geoLocation
													                                                                                      .house,
											                                                                          postcode:   carrier
													                                                                                      .geoLocation.postcode
											                                                                                      ? carrier.geoLocation
													                                                                                      .postcode
											                                                                                      : '',
											                                                                          loc:        {
												                                                                          type:        'Point',
												                                                                          coordinates: [
													                                                                          currentLong,
													                                                                          currentLat
												                                                                          ],
											                                                                          },
										                                                                          })
								                                                          )
								                                                          .then(() =>
								                                                                {
									                                                                if(!environment.production)
									                                                                {
										                                                                console.debug('Customer location updated.');
									                                                                }
									                                                                carrier$.unsubscribe();
								                                                                });
							                                                      }
							                                                      else
							                                                      {
								                                                      carrier$.unsubscribe();
							                                                      }
						                                                      })
						                                                .catch((error) =>
						                                                       {
							                                                       console.error({
								                                                                     message: 'Error getting location',
								                                                                     error
							                                                                     });
							                                                       carrier$.unsubscribe();
						                                                       });
					                                            }
				                                            });
			            }
		            }, 3000);
	}
	
	public watchOrderStatus()
	{
		this.storageService.selectedOrder$
		    .pipe(takeUntil(this.destroy$))
		    .subscribe((o) =>
		               {
			               this.isTakenFromAnotherCarrier = !!o &&
			                                                !!o.carrier &&
			                                                o.carrier !== this.storageService.carrierId;
			               this.selectedOrder = o;
		               });
	}
}
