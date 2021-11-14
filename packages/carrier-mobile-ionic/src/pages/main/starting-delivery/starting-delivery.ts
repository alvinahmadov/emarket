import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router }                                         from '@angular/router';
import { Geolocation }                                    from '@ionic-native/geolocation/ngx';
import { Subject }                                        from 'rxjs';
import { takeUntil }                                      from 'rxjs/operators';
import { OrderRouter }                                    from '@modules/client.common.angular2/routers/order-router.service';
import IOrder                                             from '@modules/server.common/interfaces/IOrder';
import IGeoLocation                                       from '@modules/server.common/interfaces/IGeoLocation';
import OrderCarrierStatus                                 from '@modules/server.common/enums/OrderCarrierStatus';
import GeoLocation                                        from '@modules/server.common/entities/GeoLocation';
import { GeoUtils }                                       from '@modules/server.common/utilities';
import { CarrierOrdersRouter }                            from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { GeoLocationService }                             from 'services/geo-location.service';
import { StorageService }                                 from 'services/storage.service';
import { MapComponent }                                   from '../common/map/map.component';

@Component({
	           selector:    'page-starting-delivery',
	           templateUrl: 'starting-delivery.html',
           })
export class StartingDeliveryPage implements AfterViewInit, OnDestroy
{
	@ViewChild('map')
	public carrierMap: MapComponent;
	
	public selectedOrder: IOrder;
	public carrierUserDistance: string;
	public disabledButtons: boolean = true;
	
	private destroy$ = new Subject<void>();
	
	constructor(
			private router: Router,
			private orderRouter: OrderRouter,
			private carrierOrdersRouter: CarrierOrdersRouter,
			private geoLocationService: GeoLocationService,
			private geolocation: Geolocation,
			private storageService: StorageService
	)
	{}
	
	public ngAfterViewInit(): void
	{
		this.loadData();
	}
	
	public ngOnDestroy(): void
	{
		this.destroy$.next();
		this.destroy$.complete();
	}
	
	public ionViewWillEnter()
	{
		this.loadData();
	}
	
	public async startDelivery()
	{
		this.disabledButtons = true;
		await this.carrierOrdersRouter.updateStatus(
				this.storageService.carrierId,
				OrderCarrierStatus.CarrierStartDelivery
		);
		
		this.router.navigateByUrl('/main/delivery', {
			skipLocationChange: false,
		});
		this.disabledButtons = false;
	}
	
	public returnProduct()
	{
		this.disabledButtons = true;
		this.storageService.returnProductFrom = 'startingDelivery';
		
		this.router.navigateByUrl('/product/return', {
			skipLocationChange: false,
		});
		this.disabledButtons = false;
	}
	
	private loadData()
	{
		this.orderRouter
		    .get(localStorage.getItem('orderId'), { populateWarehouse: true })
		    .pipe(takeUntil(this.destroy$))
		    .subscribe(async(order) =>
		               {
			               this.selectedOrder = order;
			               this.storageService.selectedOrder = order;
			
			               const position = this.geoLocationService.defaultLocation()
			                                ? this.geoLocationService.defaultLocation()
			                                : await this.geolocation.getCurrentPosition();
			
			               // MongoDb store coordinates lng => lat
			               const dbGeoInput = {
				               loc: {
					               type:        'Point',
					               coordinates: [
						               position.coords.longitude,
						               position.coords.latitude,
					               ],
				               },
			               } as IGeoLocation;
			
			               const origin = new google.maps.LatLng(
					               position.coords.latitude,
					               position.coords.longitude
			               );
			
			               const userGeo = this.selectedOrder.customer.geoLocation;
			
			               this.carrierUserDistance = GeoUtils.getDistance(
					               userGeo as GeoLocation,
					               dbGeoInput as GeoLocation
			               ).toFixed(2);
			
			               const destination = new google.maps.LatLng(
					               userGeo.loc.coordinates[1],
					               userGeo.loc.coordinates[0]
			               );
			
			               this.carrierMap.setCenter(origin);
			               this.carrierMap.drawRoute(origin, destination);
			
			               this.disabledButtons = false;
		               });
	}
}
