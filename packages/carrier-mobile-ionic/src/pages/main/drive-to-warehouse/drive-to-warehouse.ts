import { Component, ViewChild, OnInit } from '@angular/core';
import { Router }                       from '@angular/router';
import { NavController, Platform }      from '@ionic/angular';
import { Geolocation }                  from '@ionic-native/geolocation/ngx';
import ICarrier                         from '@modules/server.common/interfaces/ICarrier';
import IGeoLocation                     from '@modules/server.common/interfaces/IGeoLocation';
import IOrder                           from '@modules/server.common/interfaces/IOrder';
import OrderCarrierStatus               from '@modules/server.common/enums/OrderCarrierStatus';
import GeoLocation                      from '@modules/server.common/entities/GeoLocation';
import { CarrierRouter }                from '@modules/client.common.angular2/routers/carrier-router.service';
import { CarrierOrdersRouter }          from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { OrderRouter }                  from '@modules/client.common.angular2/routers/order-router.service';
import { CommonUtils, GeoUtils }        from '@modules/server.common/utilities';
import { StorageService }               from 'services/storage.service';
import { GeoLocationService }           from 'services/geo-location.service';
import { MapComponent }                 from '../common/map/map.component';

declare var google: any;

// noinspection ES6MissingAwait
@Component({
	           selector:    'page-drive-to-warehouse',
	           styleUrls:   ['drive-to-warehouse.scss'],
	           templateUrl: 'drive-to-warehouse.html',
           })
export class DriveToWarehousePage implements OnInit
{
	@ViewChild('map')
	public carrierMap: MapComponent;
	
	public selectedOrder: IOrder;
	public carrier: ICarrier;
	public carrierUserDistance: string;
	public workTaken: boolean;
	public fromDelivery: boolean;
	public selectedOrderID: string;
	public orderCarrierCompetition: boolean;
	public isTakenFromAnotherCarrier: boolean = false;
	
	public carrier$;
	public order$;
	
	constructor(
			private orderRouter: OrderRouter,
			private carrierRouter: CarrierRouter,
			private carrierOrdersRouter: CarrierOrdersRouter,
			private storageService: StorageService,
			private geoLocationService: GeoLocationService,
			private geolocation: Geolocation,
			private router: Router,
			private navCtrl: NavController,
			public platform: Platform
	)
	{}
	
	public ngOnInit(): void
	{
		this.fromDelivery = this.storageService.driveToWarehouseFrom === 'delivery';
	}
	
	public ionViewWillEnter()
	{
		this.carrier$ = this.carrierRouter
		                    .get(this.storageService.carrierId)
		                    .subscribe(async(c) =>
		                               {
			                               this.carrier = c;
			
			                               const position = this.geoLocationService.defaultLocation()
			                                                ? this.geoLocationService.defaultLocation()
			                                                : await this.geolocation.getCurrentPosition();
			
			                               // MongoDb storageService coordinates lng => lat
			                               let dbGeoInput = {
				                               loc: {
					                               type:        'Point',
					                               coordinates: [
						                               position.coords.longitude,
						                               position.coords.latitude,
					                               ],
				                               },
			                               } as IGeoLocation;
			
			                               if(this.order$)
			                               {
				                               await this.order$.unsubscribe();
			                               }
			
			                               const orderId = this.storageService.orderId;
			                               if(orderId)
			                               {
				                               this.order$ = this.orderRouter
				                                                 .get(orderId, {
					                                                 populateWarehouse: true,
				                                                 })
				                                                 .subscribe((order) =>
				                                                            {
					                                                            this.orderCarrierCompetition =
							                                                            order.warehouse['carrierCompetition'];
					
					                                                            this.isTakenFromAnotherCarrier =
							                                                            !!order.carrierId &&
							                                                            order.carrierId !== this.carrier._id &&
							                                                            order.carrierStatus >
							                                                            (this.orderCarrierCompetition
							                                                             ? OrderCarrierStatus.CarrierSelectedOrder
							                                                             : OrderCarrierStatus.NoCarrier);
					
					                                                            this.selectedOrder = order;
					                                                            this.storageService.selectedOrder = order;
					                                                            this.selectedOrderID = CommonUtils.getIdFromTheDate(order);
					
					                                                            if(!this.orderCarrierCompetition)
					                                                            {
						                                                            this.workTaken =
								                                                            order.carrierStatus !==
								                                                            OrderCarrierStatus.NoCarrier;
					                                                            }
					
					                                                            const origin = new google.maps.LatLng(
							                                                            position.coords.latitude,
							                                                            position.coords.longitude
					                                                            );
					
					                                                            const merchantGeo = order.warehouse['geoLocation'];
					
					                                                            this.carrierUserDistance = GeoUtils.getDistance(
							                                                            merchantGeo,
							                                                            dbGeoInput as GeoLocation
					                                                            ).toFixed(2);
					
					                                                            const destination = new google.maps.LatLng(
							                                                            merchantGeo.loc.coordinates[1],
							                                                            merchantGeo.loc.coordinates[0]
					                                                            );
					
					                                                            this.carrierMap.setCenter(origin);
					                                                            this.carrierMap.drawRoute(origin, destination);
				                                                            });
			                               }
		                               });
	}
	
	public async takeWork()
	{
		if(this.carrier && this.selectedOrder)
		{
			return await this.carrierOrdersRouter.selectedForDelivery(
					this.carrier['id'],
					[this.selectedOrder['id']]
			);
		}
		else
		{
			// TODO: replace with some popup
			alert('Try again!');
		}
	}
	
	public async skipWork()
	{
		if(this.carrier && this.selectedOrder)
		{
			await this.carrierOrdersRouter.skipOrders(this.carrier['id'], [
				this.selectedOrder['id'],
			]);
			
			this.unselectOrder();
		}
	}
	
	public async carrierInWarehouse()
	{
		if(this.fromDelivery)
		{
			this.storageService.returnProductFrom = 'driveToWarehouse';
			
			this.router.navigate(['/product/return'], {
				skipLocationChange: false,
			});
		}
		else
		{
			this.router.navigateByUrl('/product/get', {
				skipLocationChange: false,
			});
		}
		
		this.unselectDriveToWarehouseFrom();
		this.unsubscribeAll();
	}
	
	public async cancelWork()
	{
		if(this.fromDelivery)
		{
			this.unselectDriveToWarehouseFrom();
			this.router.navigateByUrl('/main/delivery', {
				skipLocationChange: true,
			});
		}
		else
		{
			if(this.carrier && this.selectedOrder)
			{
				await this.carrierOrdersRouter.cancelDelivery(
						this.carrier['id'],
						[this.selectedOrder['id']]
				);
				this.unselectOrder();
			}
		}
	}
	
	public ionViewWillLeave()
	{
		this.unselectDriveToWarehouseFrom();
		this.unsubscribeAll();
	}
	
	public unselectOrder()
	{
		this.storageService.selectedOrder = null;
		this.storageService.orderId = null;
		this.navCtrl.navigateRoot('/main/home');
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
	
	private unselectDriveToWarehouseFrom()
	{
		this.storageService.driveToWarehouseFrom = null;
	}
}
