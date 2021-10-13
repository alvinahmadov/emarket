import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params }                  from '@angular/router';
import { Subject, Subscription }                   from 'rxjs';
import GeoLocation                                 from '@modules/server.common/entities/GeoLocation';
import Carrier                                     from '@modules/server.common/entities/Carrier';
import Warehouse                                   from '@modules/server.common/entities/Warehouse';
import { CarrierRouter }                           from '@modules/client.common.angular2/routers/carrier-router.service';
import { CarrierOrdersRouter }                     from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { CarriersService }                         from '@app/@core/data/carriers.service';
import { environment }                             from 'environments/environment';
import Order                                       from '@modules/server.common/entities/Order';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	           selector:    'ea-carrier-location',
	           styleUrls:   ['./carrier-location.component.scss'],
	           templateUrl: './carrier-location.component.html',
           })
export class CarrierLocationComponent implements OnDestroy, OnInit
{
	@ViewChild('gmap', { static: true })
	public gmapElement: any;
	
	public map: google.maps.Map;
	public marker: any;
	public userMarker: any;
	public warehouseMarker: any;
	public interval: any;
	public isReverted: boolean = true;
	public carrierId: string;
	public params$: any;
	public carrierSub$: Subscription;
	private ngDestroy$ = new Subject();
	
	constructor(
			private route: ActivatedRoute,
			private carrierRouter: CarrierRouter,
			private carrierOrdersRouter: CarrierOrdersRouter,
			private carriersService: CarriersService
	)
	{}
	
	public ngOnInit(): void
	{
		this.showMap();
		this._subscribeCarrier();
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
		
		if(this.interval)
		{
			clearInterval(this.interval);
		}
		
		if(this.carrierSub$)
		{
			this.carrierSub$.unsubscribe();
		}
		
		if(this.params$)
		{
			this.params$.unsubscribe();
		}
	}
	
	public async _subscribeCarrier()
	{
		this.params$ =
				this.route
				    .params
				    .subscribe((res: Params) =>
				               {
					               const carrierId: string = res.id || this.carrierId;
					
					               this.carrierSub$ = this.carrierRouter
					                                      .get(carrierId)
					                                      .subscribe(async(carrier: Carrier) =>
					                                                 {
						                                                 if(this.interval)
						                                                 {
							                                                 clearInterval(this.interval);
						                                                 }
						                                                 const newCoordinates = new google.maps.LatLng(
								                                                 carrier.geoLocation.coordinates.lat,
								                                                 carrier.geoLocation.coordinates.lng
						                                                 );
						                                                 if(this.marker)
						                                                 {
							                                                 this.marker.setMap(null);
						                                                 }
						                                                 let isWorking = false;
						
						                                                 this.interval = setInterval(
								                                                 async() =>
								                                                 {
									                                                 const order: Order =
											                                                       await this.carriersService
											                                                                 .getCarrierCurrentOrder(carrierId);
									
									                                                 if(order)
									                                                 {
										                                                 if(!isWorking)
										                                                 {
											                                                 const customer = order.customer;
											                                                 const warehouse = order.warehouse as Warehouse;
											                                                 const warehouseIcon = environment.MAP_MERCHANT_ICON_LINK;
											                                                 const customerIcon = environment.MAP_USER_ICON_LINK;
											                                                 customer.geoLocation = new GeoLocation(
													                                                 customer.geoLocation
											                                                 );
											                                                 this.userMarker = this.addMarker(
													                                                 new google.maps.LatLng(
															                                                 customer.geoLocation.coordinates.lat,
															                                                 customer.geoLocation.coordinates.lng
													                                                 ),
													                                                 this.map,
													                                                 customerIcon
											                                                 );
											                                                 warehouse.geoLocation = new GeoLocation(
													                                                 warehouse.geoLocation
											                                                 );
											                                                 this.warehouseMarker = this.addMarker(
													                                                 new google.maps.LatLng(
															                                                 warehouse['geoLocation'].coordinates.lat,
															                                                 warehouse['geoLocation'].coordinates.lng
													                                                 ),
													                                                 this.map,
													                                                 warehouseIcon
											                                                 );
											                                                 const start = new google.maps.LatLng(
													                                                 customer.geoLocation.coordinates.lat,
													                                                 customer.geoLocation.coordinates.lng
											                                                 );
											                                                 const end = new google.maps.LatLng(
													                                                 warehouse['geoLocation'].coordinates.lat,
													                                                 warehouse['geoLocation'].coordinates.lng
											                                                 );
											                                                 const request = {
												                                                 origin:      start,
												                                                 destination: end,
												                                                 travelMode:  'DRIVING',
											                                                 };
											
											                                                 directionsService.route(request, function(
													                                                 res,
													                                                 stat
											                                                 )
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
											
											                                                 const bounds = new google.maps.LatLngBounds();
											                                                 bounds.extend(this.marker.getPosition());
											                                                 bounds.extend(
													                                                 this.warehouseMarker.getPosition()
											                                                 );
											                                                 bounds.extend(this.userMarker.getPosition());
											                                                 this.map.fitBounds(bounds);
											
											                                                 isWorking = true;
											                                                 this.isReverted = false;
											
											                                                 const userInfoContent = `
									<h3>  ${order.customer.firstName + ' ' + order.customer.lastName}</h3>
									<ul>
										<li><i style='margin-right:5px;' class="ion-md-mail"></i>${order.customer.email}</li>
										<li><i style='margin-right:5px;' class="ion-md-call"></i>${order.customer.phone}</li>
										<li><i style='margin-right:5px;' class="ion-md-locate"></i>${order.customer.geoLocation.streetAddress}</li>
									</ul>
									`;
											
											                                                 const userInfoWindow =
													                                                       new google.maps.InfoWindow(
															                                                       {
																                                                       content: userInfoContent,
															                                                       }
													                                                       );
											
											                                                 this.userMarker
											                                                     .addListener('click', () =>
											                                                     {
												                                                     userInfoWindow.open(
														                                                     this.map,
														                                                     this.userMarker
												                                                     );
											                                                     });
											                                                 const warehouseInfoContent = `
									<h3>  ${(<Warehouse>order.warehouse).name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="ion-md-mail"></i>
											${(<Warehouse>order.warehouse).contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="ion-md-phone"></i><i class="ion-md-call"></i>
											${(<Warehouse>order.warehouse).contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="ion-md-locate"></i>
											${(<Warehouse>order.warehouse).geoLocation.streetAddress}
										</li>
									</ul>
									`;
											
											                                                 const warehouseInfoWindow = new google.maps.InfoWindow(
													                                                 {
														                                                 content: warehouseInfoContent,
													                                                 }
											                                                 );
											
											                                                 this.warehouseMarker.addListener(
													                                                 'click',
													                                                 () =>
													                                                 {
														                                                 warehouseInfoWindow.open(
																                                                 this.map,
																                                                 this.warehouseMarker
														                                                 );
													                                                 }
											                                                 );
										                                                 }
									                                                 }
									                                                 else
									                                                 {
										                                                 if(isWorking)
										                                                 {
											                                                 this.revertMap();
											                                                 isWorking = false;
										                                                 }
										
										                                                 if(!this.isReverted)
										                                                 {
											                                                 this.revertMap();
										                                                 }
									                                                 }
								                                                 }, 1500);
						
						                                                 this.map.setCenter(newCoordinates);
						                                                 const carierIcon = environment.MAP_CARRIER_ICON_LINK;
						
						                                                 this.marker = this.addMarker(
								                                                 newCoordinates,
								                                                 this.map,
								                                                 carierIcon
						                                                 );
						                                                 const carrierInfoContent = `
					<h3>  ${carrier.fullName}</h3>
					<ul>
						<li>${carrier.username}</li>
						<li><i style='margin-right:5px;' class="ion-md-call"></i>${carrier.phone}</li>
						<li><i style='margin-right:5px;' class="ion-md-locate"></i>${carrier.geoLocation.streetAddress}</li>
					</ul>
					`;
						
						                                                 const carrierInfoWindow = new google.maps.InfoWindow({
							                                                                                                      content: carrierInfoContent,
						                                                                                                      });
						
						                                                 this.marker.addListener('click', () =>
						                                                 {
							                                                 carrierInfoWindow.open(this.map, this.marker);
						                                                 });
					                                                 });
				               });
	}
	
	public revertMap()
	{
		this.map.setZoom(15);
		this.warehouseMarker.setMap(null);
		this.userMarker.setMap(null);
		this.isReverted = true;
	}
	
	public showMap()
	{
		const mapProp = {
			center:    new google.maps.LatLng(
					environment.DEFAULT_LATITUDE ?? 42.642941,
					environment.DEFAULT_LONGITUDE ?? 23.334149
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
