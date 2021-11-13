// import 'style-loader!leaflet/dist/leaflet.css';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef }        from '@angular/material/dialog';
import Carrier                                  from '@modules/server.common/entities/Carrier';
import CustomerOrder                            from '@modules/server.common/entities/CustomerOrder';
import Warehouse                                from '@modules/server.common/entities/Warehouse';
import { environment }                          from 'environments/environment';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

type TCarrierLocationData = {
	carrier: Carrier;
	store: Warehouse;
	customerOrder: CustomerOrder
}

@Component({
	           selector: 'ea-carrier-location',
	           styleUrls: ['./carrier-location.component.scss'],
	           template: `
		                     <div #gmap class="googleMap"></div>`,
           })
export class CarrierLocationComponent implements OnInit
{
	@ViewChild('gmap', { static: true })
	public gmapElement: any;
	public map: google.maps.Map;
	public marker: any;
	public customerMarker: any;
	public warehouseMarker: any;
	public carrier: Carrier;
	public store: Warehouse;
	public customerOrder: CustomerOrder;
	
	constructor(
			private dialogRef: MatDialogRef<CarrierLocationComponent>,
			@Inject(MAT_DIALOG_DATA) data: TCarrierLocationData
	)
	{
		this.carrier = data.carrier;
		this.store = data.store;
		this.customerOrder = data.customerOrder;
	}
	
	public ngOnInit(): void
	{
		this.showMap();
		this.showIconsOnMap();
	}
	
	public showIconsOnMap()
	{
		const newCoordinates = new google.maps.LatLng(
				this.carrier.geoLocation.coordinates.lat,
				this.carrier.geoLocation.coordinates.lng
		);
		
		const warehouseIcon = environment.STORE_ICON;
		const customerIcon = environment.CUSTOMER_ICON;
		
		this.customerMarker = this.addMarker(
				new google.maps.LatLng(
						this.customerOrder.geoLocation.coordinates.lat,
						this.customerOrder.geoLocation.coordinates.lng
				),
				this.map,
				customerIcon
		);
		
		this.warehouseMarker = this.addMarker(
				new google.maps.LatLng(
						this.store.geoLocation.coordinates.lat,
						this.store.geoLocation.coordinates.lng
				),
				this.map,
				warehouseIcon
		);
		const start = new google.maps.LatLng(
				this.customerOrder.geoLocation.coordinates.lat,
				this.customerOrder.geoLocation.coordinates.lng
		);
		const end = new google.maps.LatLng(
				this.store.geoLocation.coordinates.lat,
				this.store.geoLocation.coordinates.lng
		);
		const request = {
			origin:      start,
			destination: end,
			travelMode:  'DRIVING',
		};
		
		directionsService.route(request, function(res, stat)
		{
			if(stat === 'OK')
			{
				directionsDisplay.setDirections(res);
			}
		});
		
		directionsDisplay.setOptions({
			                             suppressMarkers: true,
		                             });
		directionsDisplay.setMap(this.map);
		
		const warehouseInfoContent = `
									<h3>  ${this.store.name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="ion-md-mail"></i>
											${this.store.contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="ion-md-phone"></i><i class="ion-md-call"></i>
											${this.store.contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="ion-md-locate"></i>
											${this.store.geoLocation.streetAddress}
										</li>
									</ul>
									`;
		
		const warehouseInfoWindow = new google.maps.InfoWindow({
			                                                       content: warehouseInfoContent,
		                                                       });
		
		this.warehouseMarker.addListener('click', () =>
		{
			warehouseInfoWindow.open(this.map, this.warehouseMarker);
		});
		
		this.map.setCenter(newCoordinates);
		const carrierIcon = environment.CARRIER_ICON;
		
		this.marker = this.addMarker(newCoordinates, this.map, carrierIcon);
		const carrierInfoContent = `
					<h3>  ${this.carrier.fullName}</h3>
					<ul>
						<li>${this.carrier.username}</li>
						<li><i style='margin-right:5px;' class="ion-md-call"></i>${this.carrier.phone}</li>
						<li><i style='margin-right:5px;' class="ion-md-locate"></i>${this.carrier.geoLocation.streetAddress}</li>
					</ul>
					`;
		
		const carrierInfoWindow = new google.maps.InfoWindow({
			                                                     content: carrierInfoContent,
		                                                     });
		
		this.marker.addListener('click', () =>
		{
			carrierInfoWindow.open(this.map, this.marker);
		});
	}
	
	public revertMap()
	{
		this.map.setZoom(15);
		this.warehouseMarker.setMap(null);
		this.customerMarker.setMap(null);
	}
	
	public showMap()
	{
		const mapProp = {
			center:    new google.maps.LatLng(
					environment.DEFAULT_LATITUDE,
					environment.DEFAULT_LONGITUDE
			),
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
}
