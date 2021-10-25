import {
	Component,
	ViewChild,
	ElementRef,
	OnDestroy,
	OnInit,
}                                   from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import { Subject, Subscription }    from 'rxjs';
import { IonicSelectableComponent } from 'ionic-selectable';
import Carrier                      from '@modules/server.common/entities/Carrier';
import Order                        from '@modules/server.common/entities/Order';
import { CarrierService }           from 'services/carrier.service';
import { WarehousesService }        from 'services/warehouses.service';
import { WarehouseOrdersService }   from 'services/warehouse-orders.service';
import { StorageService } from 'services/storage.service';

declare var google: any;

@Component({
	           selector:    'page-track',
	           templateUrl: 'track.html',
	           styleUrls:   ['./track.scss'],
           })
export class TrackPage implements OnInit, OnDestroy
{
	private carriersOnDisplay: Carrier[];
	private carriers$: Subscription;
	private warehouse$: Subscription;
	private params$: Subscription;
	private warehouseCoordinates: any;
	private orders$: Subscription;
	private _ngDestroy$ = new Subject<void>();
	
	public map: google.maps.Map;
	public selectedCarrier: Carrier;
	public carriers: Carrier[];
	public markers: google.maps.Marker[] = [];
	public totalDeliveries = 0;
	public totalCarriers = 0;
	public totalActiveCarriers = 0;
	public showAssignedOnly = true;
	public showActiveOnly = true;
	public showCheckboxFilters = true;
	public loadingMap = false;
	public listOfOrders: any;
	public storeIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon21.png';
	public sharedCarrierIcon = 'http://maps.google.com/mapfiles/kml/pal4/icon23.png';
	public userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';
	public carrierIcon = 'http://maps.google.com/mapfiles/kml/pal4/icon54.png';
	public carrierListDropdown: Carrier[];
	public sharedCarrierListId: string[];
	
	@ViewChild('gmap', { static: true })
	public gmapElement: ElementRef;
	
	@ViewChild('filterComponent', { static: true })
	public filterComponent: IonicSelectableComponent;
	
	constructor(
			private carrierService: CarrierService,
			private route: ActivatedRoute,
			private router: Router,
			private warehouseService: WarehousesService,
			private warehouseOrderService: WarehouseOrdersService,
			private storageService: StorageService,
	)
	{
		this.route.params.subscribe(() => this.loadData());
	}
	
	public ngOnInit(): void {}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
		if(this.carriers$)
		{
			this.carriers$.unsubscribe();
		}
		if(this.params$)
		{
			this.params$.unsubscribe();
		}
	}
	
	public openModal()
	{
		this.filterComponent.close();
	}
	
	public navigationHandler(event: {
		component: IonicSelectableComponent;
		value: any;
	})
	{
		this.carriers$.unsubscribe();
		this.params$.unsubscribe();
		this.warehouse$.unsubscribe();
		this.router.navigate([`track/${event.value.id}`]);
	}
	
	public loadData()
	{
		this.warehouse$ = this.warehouseService
		                      .getAllStores()
		                      .subscribe((warehouse) =>
		                                 {
			                                 const currentWarehouse = warehouse.find(
					                                 (wh) => wh.id === this.warehouseId
			                                 );
			                                 const allAssignedCarriers = warehouse
					                                 .filter((wh) => wh.id !== this.warehouseId)
					                                 .map((wh) => wh.usedCarriersIds);
			
			                                 this.warehouseCoordinates = {
				                                 lat: currentWarehouse.geoLocation.loc.coordinates[1],
				                                 lng: currentWarehouse.geoLocation.loc.coordinates[0],
			                                 };
			                                 this.totalCarriers = currentWarehouse.usedCarriersIds.length;
			                                 this.carriers$ = this.carrierService
			                                                      .getAllCarriers()
			                                                      .subscribe((carriers) =>
			                                                                 {
				                                                                 this.loadGoogleMaps();
				                                                                 this.carriers = carriers.filter((car) =>
				                                                                                                 {
					                                                                                                 if(
							                                                                                                 currentWarehouse.usedCarriersIds.includes(
									                                                                                                 car.id
							                                                                                                 )
					                                                                                                 )
					                                                                                                 {
						                                                                                                 car.shared = false;
						                                                                                                 return true;
					                                                                                                 }
					                                                                                                 else
					                                                                                                 {
						                                                                                                 if(
								                                                                                                 allAssignedCarriers.every(
										                                                                                                 (arr) => !arr.includes(car.id)
								                                                                                                 )
						                                                                                                 )
						                                                                                                 {
							                                                                                                 car.shared = true;
							                                                                                                 return true;
						                                                                                                 }
						                                                                                                 else
						                                                                                                 {
							                                                                                                 return false;
						                                                                                                 }
					                                                                                                 }
				                                                                                                 });
				                                                                 let total = 0;
				
				                                                                 this.carriers.forEach((car) =>
				                                                                                       {
					                                                                                       total += car.numberOfDeliveries;
				                                                                                       });
				
				                                                                 this.totalDeliveries = total;
				
				                                                                 this.params$ = this.route.params.subscribe((res) =>
				                                                                                                            {
					                                                                                                            this.totalActiveCarriers = this.carriers.filter(
							                                                                                                            (car) => car.status === 0
					                                                                                                            ).length;
					
					                                                                                                            if(res.id)
					                                                                                                            {
						                                                                                                            this.selectedCarrier = this.carriers.filter(
								                                                                                                            (car) => car.id === res.id
						                                                                                                            )[0];
						                                                                                                            this.showCheckboxFilters = false;
						                                                                                                            this.carriersOnDisplay = [this.selectedCarrier];
						                                                                                                            this.renderCarriers([this.selectedCarrier]);
						                                                                                                            this.filterDisplayedCarriers();
					                                                                                                            }
					                                                                                                            else
					                                                                                                            {
						                                                                                                            this.filterDisplayedCarriers();
						                                                                                                            this.renderCarriers(this.carriersOnDisplay);
					                                                                                                            }
				                                                                                                            });
			                                                                 });
		                                 });
	}
	
	public get warehouseId(): string
	{
		return this.storageService.warehouseId;
	}
	
	public drawOrderRoutes()
	{
		this.warehouseOrderService
		    .getOrdersInDelivery(this.warehouseId)
		    .then((orderList: Order[]) =>
		          {
			          this.listOfOrders = orderList;
			          this.listOfOrders
			              .forEach((order: Order) =>
			                       {
				                       const carrier: Carrier = this.carriersOnDisplay.find(
						                       (x) => (order?.carrierId)
						                              ? x.id === order.carrierId
						                              : typeof order.carrier === Carrier.name
						                                ? x.id === (order.carrier as Carrier).id
						                                : false
				                       );
				
				                       if(carrier && carrier.shared)
				                       {
					                       let _carrier = order.carrier as Carrier;
					                       this.addMarker(
							                       {
								                       lat: _carrier.geoLocation
										                            .loc
										                            .coordinates[1],
								                       lng: _carrier.geoLocation
										                            .loc
										                            .coordinates[0],
							                       },
							                       this.map,
							                       this.sharedCarrierIcon
					                       );
				                       }
				                       const carrierId = order?.carrierId
				                                         ? order.carrierId
				                                         : (order.carrier as Carrier).id;
				
				                       const carriersWithOrders = orderList.map(
						                       (o) => typeof o.carrier === 'string'
						                              ? o.carrier
						                              : o.carrier.id
				                       );
				                       this.carriers = this.carriers.filter(
						                       (car) => !(!carriersWithOrders.includes(car.id) &&
						                                  car.shared));
				                       this.carrierListDropdown = this.carriers;
				
				                       if(
						                       this.carriersOnDisplay
						                           .map((car) => car.id)
						                           .includes(carrierId)
				                       )
				                       {
					                       this.addMarker(
							                       {
								                       lat: order.customer.geoLocation.loc.coordinates[1],
								                       lng: order.customer.geoLocation.loc.coordinates[0],
							                       },
							                       this.map,
							                       this.userIcon
					                       );
					
					                       const request = {
						                       origin:      new google.maps.LatLng(
								                       (order.carrier as Carrier)
										                       .geoLocation.loc.coordinates[1],
								                       (order.carrier as Carrier)
										                       .geoLocation.loc.coordinates[0]
						                       ),
						                       destination: new google.maps.LatLng(
								                       order.customer.geoLocation.loc.coordinates[1],
								                       order.customer.geoLocation.loc.coordinates[0]
						                       ),
						                       travelMode:  'DRIVING',
					                       };
					                       const directionsDisplay = new google.maps.DirectionsRenderer(
							                       {
								                       polylineOptions: {
									                       strokeColor: `hsl(${Math.floor(
											                       Math.random() * 320
									                       )},100%,50%)`,
								                       },
							                       }
					                       );
					                       const directionsService = new google.maps.DirectionsService();
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
			                       });
		          });
	}
	
	public renderCarriers(carriers: Carrier[])
	{
		if(this.markers.length > 0)
		{
			this.markers.forEach((m) =>
			                     {
				                     m.setMap(null);
			                     });
			this.markers = [];
		}
		carriers.forEach((carrier) =>
		                 {
			                 const mylatLng = {
				                 lat: carrier.geoLocation.loc.coordinates[1],
				                 lng: carrier.geoLocation.loc.coordinates[0],
			                 };
			                 this.addMarker(this.warehouseCoordinates, this.map, this.storeIcon);
			
			                 if(!carrier.shared)
			                 {
				                 this.addMarker(mylatLng, this.map, this.carrierIcon);
			                 }
		                 });
		this.drawOrderRoutes();
	}
	
	public filterDisplayedCarriers()
	{
		let filteredCarriers = this.carriers;
		if(this.showActiveOnly && this.carriers.length > 1)
		{
			filteredCarriers = filteredCarriers.filter(
					(car) => car.status === 0
			);
		}
		
		if(this.showAssignedOnly && this.carriers.length > 1)
		{
			filteredCarriers = filteredCarriers.filter(
					(car) => car.shared === false
			);
		}
		this.carrierListDropdown = filteredCarriers;
		this.carriersOnDisplay = filteredCarriers;
	}
	
	public loadGoogleMaps()
	{
		this.loadingMap = true;
		const initialCoords = new google.maps.LatLng(42.7089136, 23.3702736);
		
		const mapProp = {
			center:    initialCoords,
			zoom:      13,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		this.loadingMap = false;
	}
	
	public addMarker(
			position: { lat: number; lng: number },
			map: google.maps.Map,
			icon: string
	)
	{
		const marker = new google.maps.Marker({
			                                      position,
			                                      map,
			                                      icon,
		                                      });
		this.markers.push(marker);
	}
	
	public refreshMap()
	{
		this.filterDisplayedCarriers();
		this.renderCarriers(this.carriersOnDisplay);
	}
}
