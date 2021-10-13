import {
	Component,
	ViewChild,
}                                from '@angular/core';
import {
	ActivatedRoute,
	Params
}                                from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import Carrier                   from '@modules/server.common/entities/Carrier';
import GeoLocation               from '@modules/server.common/entities/GeoLocation';
import Order                     from '@modules/server.common/entities/Order';
import Warehouse                 from '@modules/server.common/entities/Warehouse';
import { CarrierOrdersRouter }   from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { CarrierRouter }         from '@modules/client.common.angular2/routers/carrier-router.service';
import { CarriersService }       from '@app/@core/data/carriers.service';
import { environment }           from 'environments/environment';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	           selector:    'ea-carrier-map',
	           styleUrls:   ['carrier-map.component.scss'],
	           templateUrl: './carrier-map.component.html',
           })
export class CarrierMapComponent
{
	@ViewChild('gmap', { static: true })
	public gmapElement: any;
	
	public carrierId: string;
	public map: google.maps.Map;
	public marker: any;
	public userMarker: any;
	public warehouseMarker: any;
	public interval: any;
	public isReverted: boolean = true;
	public carrierSub$: Subscription;
	public params$: Params;
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
	
	private async _subscribeCarrier()
	{
		this.params$ = this.route
		                   .params
		                   .subscribe(() =>
		                              {
			                              const carrierId = this.carrierId;
			
			                              this.carrierSub$ = this.carrierRouter.get(carrierId).subscribe(
					                              async(carrier: Carrier) =>
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
									                              const order: Order = await this.carriersService.getCarrierCurrentOrder(
											                              carrierId
									                              );
									                              if(order)
									                              {
										                              if(!isWorking)
										                              {
											                              const user = order.customer;
											                              const warehouse = order.warehouse as Warehouse;
											                              const warehouseIcon =
													                                    environment.MAP_MERCHANT_ICON_LINK;
											                              const userIcon = environment.MAP_USER_ICON_LINK;
											                              user.geoLocation = new GeoLocation(
													                              user.geoLocation
											                              );
											                              this.userMarker =
													                              CarrierMapComponent.addMarker(
															                              new google.maps.LatLng(
																	                              user.geoLocation.coordinates.lat,
																	                              user.geoLocation.coordinates.lng
															                              ),
															                              this.map,
															                              userIcon
													                              );
											                              warehouse.geoLocation = new GeoLocation(
													                              warehouse.geoLocation
											                              );
											                              this.warehouseMarker =
													                              CarrierMapComponent.addMarker(
															                              new google.maps.LatLng(
																	                              warehouse['geoLocation'].coordinates.lat,
																	                              warehouse['geoLocation'].coordinates.lng
															                              ),
															                              this.map,
															                              warehouseIcon
													                              );
											
											                              const bounds = new google.maps.LatLngBounds();
											                              bounds.extend(this.marker.getPosition());
											                              bounds.extend(
													                              this.warehouseMarker.getPosition()
											                              );
											                              bounds.extend(this.userMarker.getPosition());
											                              this.map.fitBounds(bounds);
											
											                              isWorking = true;
											                              this.isReverted = false;
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
						
						                              this.marker = CarrierMapComponent.addMarker(
								                              newCoordinates,
								                              this.map,
								                              carierIcon
						                              );
					                              });
		                              });
	}
	
	private static addMarker(position, map, icon)
	{
		return new google.maps.Marker({
			                              position,
			                              map,
			                              icon,
		                              });
	}
}
