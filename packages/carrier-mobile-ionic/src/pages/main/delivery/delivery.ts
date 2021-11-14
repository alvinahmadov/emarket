import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router }                                         from '@angular/router';
import { Mixpanel }                                       from '@ionic-native/mixpanel/ngx';
import { Geolocation }                                    from '@ionic-native/geolocation/ngx';
import { Subject }                                        from 'rxjs';
import { takeUntil }                                      from 'rxjs/operators';
import IGeoLocation                                       from '@modules/server.common/interfaces/IGeoLocation';
import IOrder                                             from '@modules/server.common/interfaces/IOrder';
import OrderCarrierStatus                                 from '@modules/server.common/enums/OrderCarrierStatus';
import GeoLocation                                        from '@modules/server.common/entities/GeoLocation';
import { GeoUtils }                                       from '@modules/server.common/utilities';
import { OrderRouter }                                    from '@modules/client.common.angular2/routers/order-router.service';
import { MapComponent }                                   from '../common/map/map.component';
import { StorageService }                                 from '../../../services/storage.service';
import { GeoLocationService }                             from '../../../services/geo-location.service';

declare var google: any;

@Component({
	           selector:    'page-delivery',
	           templateUrl: 'delivery.html',
           })
export class DeliveryPage implements AfterViewInit, OnDestroy
{
	@ViewChild('map')
	public carrierMap: MapComponent;
	
	public selectedOrder: IOrder;
	public carrierUserDistance: string;
	public disabledButtons: boolean = true;
	
	private destroy$ = new Subject<void>();
	
	constructor(
			private orderRouter: OrderRouter,
			private mixpanel: Mixpanel,
			private geoLocationService: GeoLocationService,
			private geolocation: Geolocation,
			private router: Router,
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
	
	public get fullAddress(): string
	{
		return this.selectedOrder.customer.fullAddress;
	}
	
	public async delivered()
	{
		this.disabledButtons = true;
		if(this.selectedOrder)
		{
			await this.router.navigateByUrl('/main/home', {
				skipLocationChange: false,
			});
			
			this.unselectOrder();
			
			await this.orderRouter.updateCarrierStatus(
					this.selectedOrder['id'],
					OrderCarrierStatus.DeliveryCompleted
			);
			
			await this.mixpanel.track('Order Delivered');
		}
		else
		{
			alert('Try again!');
		}
		this.disabledButtons = false;
	}
	
	public cancel()
	{
		this.disabledButtons = true;
		this.storageService.driveToWarehouseFrom = 'delivery';
		this.router.navigateByUrl('/main/drive-to-warehouse', {
			skipLocationChange: false,
		});
	}
	
	public ionViewWillEnter() {}
	
	public ionViewWillLeave() {}
	
	private unselectOrder()
	{
		this.storageService.orderId = null
		this.storageService.selectedOrder = null;
	}
	
	private loadData()
	{
		this.orderRouter
		    .get(this.storageService.orderId, { populateWarehouse: true })
		    .pipe(takeUntil(this.destroy$))
		    .subscribe(async(order) =>
		               {
			               this.selectedOrder = order;
			               this.storageService.selectedOrder = order;
			               // const carrier = await this.carrierRouter
			               // 	.get(order.carrierId)
			               // 	.pipe(first())
			               // 	.toPromise();
			
			               const position = this.geoLocationService.defaultLocation()
			                                ? this.geoLocationService.defaultLocation()
			                                : await this.geolocation.getCurrentPosition();
			
			               // MongoDb storageService coordinates lng => lat
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
			               const userGeo = order.customer.geoLocation;
			
			               this.carrierUserDistance = GeoUtils.getDistance(
					               userGeo,
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
