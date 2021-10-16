import {
	Component,
	ViewChild,
	ElementRef,
	Input,
	OnInit
}                            from '@angular/core';
import { ModalController }   from '@ionic/angular';
import Carrier               from '@modules/server.common/entities/Carrier';
import Warehouse             from '@modules/server.common/entities/Warehouse';
import Customer              from '@modules/server.common/entities/Customer';
import { CarrierService }    from 'services/carrier.service';
import { WarehousesService } from 'services/warehouses.service';

declare var google: any;

const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	           selector:    'carrier-track-popup',
	           styleUrls:   ['./carrier-track-popup.scss'],
	           templateUrl: './carrier-track-popup.html',
           })
export class CarrierTrackPopup implements OnInit
{
	@ViewChild('gmap', { static: true })
	public gmapElement: ElementRef;
	
	@Input()
	public carrier: Carrier;
	
	public map: google.maps.Map;
	
	public myLatLng = { lat: 0, lng: 0 };
	
	private coordinates: any;
	public warehouse: Warehouse;
	public customer: Customer;
	public storeIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon21.png';
	public userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';
	public carrierIcon = 'http://maps.google.com/mapfiles/kml/pal4/icon54.png';
	
	constructor(
			public modalCtrl: ModalController,
			private carriersService: CarrierService,
			private warehouseService: WarehousesService
	)
	{}
	
	public ngOnInit(): void
	{
		const geoLocation = this.carrier.geoLocation;
		
		this.coordinates = [
			geoLocation.coordinates.lat,
			geoLocation.coordinates.lng,
		];
		
		this.myLatLng.lat = this.coordinates[0];
		this.myLatLng.lng = this.coordinates[1];
		
		this.loadMap();
	}
	
	public get warehouseId(): string
	{
		return localStorage.getItem('_warehouseId');
	}
	
	public get longitude(): string
	{
		return this.carrier.geoLocation.loc.coordinates[0].toFixed(6);
	}
	
	public get latitude(): string
	{
		return this.carrier.geoLocation.loc.coordinates[1].toFixed(6);
	}
	
	public async loadMap()
	{
		const mapProp = {
			center:    this.myLatLng,
			zoom:      15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		
		const carrierInfoContent = `
		<div class="carrier-track-carrier-info">
			<h3>  ${this.carrier.fullName}</h3>
			<ul>
				<li>${this.carrier.username}</li>
				<li><i style='margin-right:5px;' class="fa fa-phone"></i>${this.carrier.phone}</li>
				<li><i style='margin-right:5px;' class="fa fa-address-card"></i>${this.carrier.geoLocation.streetAddress}</li>
			</ul>
		</div>
			`;
		
		this.warehouse = await this.warehouseService
		                           .getStoreById(this.warehouseId)
		                           .toPromise();
		
		if(this.carrier.status !== 0)
		{
			const carrierMarker = this.addMarker(
					this.myLatLng,
					this.map,
					this.carrierIcon
			);
			
			const carrierInfoWindow = new google.maps.InfoWindow({
				                                                     content: carrierInfoContent,
			                                                     });
			carrierMarker.addListener('click', () =>
			{
				carrierInfoWindow.open(this.map, carrierMarker);
			});
			const warehouseInfoContent = `
                                <div class="carrier-info">
									<h3>  ${this.warehouse.name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="fa fa-envelope-open"></i>
											${this.warehouse.contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-phone"></i>
											${this.warehouse.contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-address-card"></i>
											${this.warehouse.geoLocation.streetAddress}
										</li>
                                    </ul>
                                </div>
									`;
			
			const warehouseInfoWindow = new google.maps.InfoWindow({
				                                                       content: warehouseInfoContent,
			                                                       });
			
			const warehouseMarker = this.addMarker(
					{
						lat: this.warehouse.geoLocation.loc.coordinates[1],
						lng: this.warehouse.geoLocation.loc.coordinates[0],
					},
					this.map,
					this.storeIcon
			);
			
			warehouseMarker.addListener('click', () =>
			{
				warehouseInfoWindow.open(this.map, warehouseMarker);
			});
		}
		else if(this.carrier.status === 0)
		{
			const order = await this.carriersService.getCarrierCurrentOrder(
					this.carrier.id
			);
			
			const carrierMarker = this.addMarker(
					this.myLatLng,
					this.map,
					this.carrierIcon
			);
			
			const carrierInfoWindow = new google.maps.InfoWindow({
				                                                     content: carrierInfoContent,
			                                                     });
			carrierMarker.addListener('click', () =>
			{
				carrierInfoWindow.open(this.map, carrierMarker);
			});
			
			const warehouseMarker = this.addMarker(
					{
						lat: this.warehouse.geoLocation.loc.coordinates[1],
						lng: this.warehouse.geoLocation.loc.coordinates[0],
					},
					this.map,
					this.storeIcon
			);
			
			const warehouseInfoContent = `
                                <div class="carrier-info">
									<h3>  ${this.warehouse.name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="fa fa-envelope-open"></i>
											${this.warehouse.contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-phone"></i>
											${this.warehouse.contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-address-card"></i>
											${this.warehouse.geoLocation.streetAddress}
										</li>
                                    </ul>
                                </div>
									`;
			
			const warehouseInfoWindow = new google.maps.InfoWindow({
				                                                       content: warehouseInfoContent,
			                                                       });
			
			warehouseMarker.addListener('click', () =>
			{
				warehouseInfoWindow.open(this.map, warehouseMarker);
			});
			
			// TODO: put into separate userInfo control
			
			if(order)
			{
				this.customer = order.customer as Customer;
				const userMarker = this.addMarker(
						{
							lat: this.customer.geoLocation.loc.coordinates[1],
							lng: this.customer.geoLocation.loc.coordinates[0],
						},
						this.map,
						this.userIcon
				);
				const userInfoContent = `
                                <div class="carrier-info">
                                    <h3>  ${this.customer.fullName}</h3>
                                        <ul>
                                            <li><i style='margin-right:5px;' class="fa fa-envelope-open"></i>
												${this.customer.email}</li>
                                            <li><i style='margin-right:5px;' class="fa fa-phone"></i>
												${this.customer.phone}</li>
											<li><i style='margin-right:5px;' class="fa fa-address-card"></i>
												${this.customer.geoLocation.streetAddress}</li>
                                        </ul>
                                <div class="carrier-info">
								`;
				
				const userInfoWindow = new google.maps.InfoWindow({
					                                                  content: userInfoContent,
				                                                  });
				
				userMarker.addListener('click', () =>
				{
					userInfoWindow.open(this.map, userMarker);
				});
				const start = new google.maps.LatLng(
						this.customer.geoLocation.loc.coordinates[1],
						this.customer.geoLocation.loc.coordinates[0]
				);
				
				const end = new google.maps.LatLng(
						this.warehouse.geoLocation.loc.coordinates[1],
						this.warehouse.geoLocation.loc.coordinates[0]
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
			}
		}
	}
	
	public addMarker(position, map, icon)
	{
		return new google.maps.Marker({
			                              position,
			                              map,
			                              icon,
		                              });
	}
	
	public cancelModal()
	{
		this.modalCtrl.dismiss();
	}
}
