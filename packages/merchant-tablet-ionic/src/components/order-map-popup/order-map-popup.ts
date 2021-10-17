import {
	Component,
	ViewChild,
	ElementRef,
	Input,
	OnInit
}                          from '@angular/core';
import {
	LoadingController,
	ActionSheetController,
	ModalController,
}                          from '@ionic/angular';
import { first }           from 'rxjs/operators';
import Carrier             from '@modules/server.common/entities/Carrier';
import Order               from '@modules/server.common/entities/Order';
import Warehouse           from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { environment }     from 'environments/environment';

declare var google: any;

@Component({
	           selector:    'order-map-popup',
	           styleUrls:   ['./order-map-popup.scss'],
	           templateUrl: './order-map-popup.html',
           })
export class OrderMapPopupPage implements OnInit
{
	@ViewChild('gmap', { static: true })
	public gmapElement: ElementRef;
	
	@Input()
	public order: Order;
	
	public map: google.maps.Map;
	public myLatLng = { lat: 0, lng: 0 };
	
	public warehouse: Warehouse;
	
	public marker: any;
	public userMarker: any;
	public warehouseMarker: any;
	
	public merchantIcon = environment.MAP_MERCHANT_ICON_LINK;
	public customerIcon = environment.MAP_USER_ICON_LINK;
	public carrierIcon = environment.MAP_CARRIER_ICON_LINK;
	
	constructor(
			public loadingCtrl: LoadingController,
			public actionSheetCtrl: ActionSheetController,
			public warehouseRouter: WarehouseRouter,
			public modalController: ModalController
	)
	{}
	
	public ngOnInit(): void
	{
		if(this.order)
		{
			this.loadWarehouse();
		}
		this.showMap();
	}
	
	public loadMap()
	{
		if(this.order && this.warehouse)
		{
			const customer = this.order.customer;
			const warehouse = this.warehouse;
			const carrier = this.order.carrier as Carrier;
			const warehouseIcon = this.merchantIcon;
			const customerIcon = this.customerIcon;
			
			const carrierIcon = this.carrierIcon;
			
			const [cLng, cLat] = carrier.geoLocation.loc.coordinates;
			this.marker = this.addMarker(
					new google.maps.LatLng(cLat, cLng),
					this.map,
					carrierIcon
			);
			
			const [uLng, uLat] = customer.geoLocation.loc.coordinates;
			this.userMarker = this.addMarker(
					new google.maps.LatLng(uLat, uLng),
					this.map,
					customerIcon
			);
			
			const [wLng, wLat] = warehouse.geoLocation.loc.coordinates;
			this.warehouseMarker = this.addMarker(
					new google.maps.LatLng(wLat, wLng),
					this.map,
					warehouseIcon
			);
			
			const bounds = new google.maps.LatLngBounds();
			bounds.extend(this.marker.getPosition());
			bounds.extend(this.warehouseMarker.getPosition());
			bounds.extend(this.userMarker.getPosition());
			this.map.fitBounds(bounds);
		}
	}
	
	public cancelModal()
	{
		this.modalController.dismiss();
	}
	
	public showMap()
	{
		const [lng, lat] = this.warehouse
		                   ? this.warehouse.geoLocation.loc.coordinates
		                   : [
					environment.DEFAULT_LONGITUDE,
					environment.DEFAULT_LATITUDE
				];
		const mapProp = {
			center:    new google.maps.LatLng(lat, lng),
			zoom:      15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}
	
	public addMarker(position, map, icon)
	{
		return new google.maps.Marker({
			                              position,
			                              map,
			                              icon,
		                              });
	}
	
	public getfullAddress(geoLocation): string
	{
		return (
				`${geoLocation.city}, ${geoLocation.streetAddress} ` +
				`${geoLocation.house}`
		);
	}
	
	private async loadWarehouse()
	{
		this.warehouse = await this.warehouseRouter
		                           .get(this.order.warehouseId, false)
		                           .pipe(first())
		                           .toPromise();
		
		this.loadMap();
	}
}
