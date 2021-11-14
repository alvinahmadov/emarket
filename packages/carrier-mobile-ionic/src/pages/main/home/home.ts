import { Component, ViewChild }     from '@angular/core';
import { Router }                   from '@angular/router';
import { LocalNotifications }       from '@ionic-native/local-notifications/ngx';
import { Subscription }             from 'rxjs'
import ICarrier                     from '@modules/server.common/interfaces/ICarrier';
import IGeoLocation                 from '@modules/server.common/interfaces/IGeoLocation';
import CarrierStatus                from '@modules/server.common/enums/CarrierStatus';
import { Geolocation }              from '@ionic-native/geolocation/ngx';
import { CarrierRouter }            from '@modules/client.common.angular2/routers/carrier-router.service';
import { GeoLocationOrdersService } from 'services/geo-location-order.service';
import { GeoLocationService }       from 'services/geo-location.service';
import { StorageService }           from 'services/storage.service';
import { MapComponent }             from '../common/map/map.component';

declare var google: any;

@Component({
	           selector:    'page-home',
	           templateUrl: 'home.html',
           })
export class HomePage
{
	@ViewChild('map')
	public carrierMap: MapComponent;
	
	public carrier: ICarrier;
	public isWorking: boolean;
	public carrier$: Subscription;
	public order$: Subscription;
	public marker: any;
	public map: any;
	
	constructor(
			private carrierRouter: CarrierRouter,
			private localNotifications: LocalNotifications,
			private storageService: StorageService,
			private geoLocationOrdersService: GeoLocationOrdersService,
			private geolocation: Geolocation,
			private geoLocationService: GeoLocationService,
			private router: Router
	)
	{}
	
	public ionViewWillEnter()
	{
		this.storageService.returnProductFrom = null;
		this.storageService.driveToWarehouseFrom = null;
		this.loadData();
	}
	
	public ionViewWillLeave()
	{
		this.unsubscribeAll();
	}
	
	public async startWorking()
	{
		const res = await this.carrierRouter.updateStatus(
				this.storageService.carrierId,
				CarrierStatus.Online
		);
		
		this.isWorking = res.status === CarrierStatus.Online;
	}
	
	public async stopWorking()
	{
		const res = await this.carrierRouter.updateStatus(
				this.storageService.carrierId,
				CarrierStatus.Offline
		);
		
		this.isWorking = res.status === CarrierStatus.Online;
		this.storageService.orderId = null
		this.storageService.selectedOrder = null;
	}
	
	public notification()
	{
		this.localNotifications.schedule({
			                                 id:      1,
			                                 title:   'Attention',
			                                 text:    'New order nearby you!',
			                                 led:     'FFFF00',
			                                 vibrate: true,
			                                 wakeup:  false,
		                                 });
	}
	
	private async loadData()
	{
		this.carrier$ = this.carrierRouter
		                    .get(this.storageService.carrierId)
		                    .subscribe(async(carrier) =>
		                               {
			                               this.isWorking = carrier.status === CarrierStatus.Online;
			                               this.carrier = carrier;
			                               const position = this.geoLocationService.defaultLocation()
			                                                ? this.geoLocationService.defaultLocation()
			                                                : await this.geolocation.getCurrentPosition();
			
			                               // MongoDb store coordinates lng => lat
			                               let dbGeoInput = {
				                               loc: {
					                               type:        'Point',
					                               coordinates: [
						                               position.coords.longitude,
						                               position.coords.latitude,
					                               ],
				                               },
			                               } as IGeoLocation;
			
			                               this.carrierMap.addMarker(
					                               new google.maps.LatLng(
							                               position.coords.latitude,
							                               position.coords.longitude
					                               )
			                               );
			
			                               if(this.order$)
			                               {
				                               await this.order$.unsubscribe();
			                               }
			
			                               if(carrier.status === CarrierStatus.Online)
			                               {
				                               this.order$ = this.geoLocationOrdersService
				                                                 .getOrderForWork(
						                                                 dbGeoInput,
						                                                 carrier.skippedOrderIds,
						                                                 { sort: 'asc' },
						                                                 {
							                                                 isCancelled: false,
						                                                 }
				                                                 )
				
				                                                 .subscribe(async(order) =>
				                                                            {
					                                                            if(order || this.storageService.orderId)
					                                                            {
						                                                            if(this.marker)
						                                                            {
							                                                            this.marker.setMap(null);
						                                                            }
						                                                            this.notification();
						                                                            if(!this.storageService.orderId)
						                                                            {
							                                                            this.storageService.orderId = order.id;
						                                                            }
						
						                                                            this.unsubscribeAll();
						
						                                                            this.router.navigateByUrl(
								                                                            '/main/drive-to-warehouse',
								                                                            { skipLocationChange: false }
						                                                            );
					                                                            }
				                                                            });
			                               }
			
			                               this.carrierMap.setCenter(
					                               new google.maps.LatLng(
							                               position.coords.latitude,
							                               position.coords.longitude
					                               )
			                               );
		                               });
	}
	
	private unsubscribeAll()
	{
		if(this.carrier$)
		{
			this.carrier$.unsubscribe();
		}
		if(this.order$)
		{
			this.order$.unsubscribe();
		}
	}
}
