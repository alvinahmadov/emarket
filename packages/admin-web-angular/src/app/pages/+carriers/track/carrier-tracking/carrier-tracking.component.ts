import {
	Component,
	EventEmitter,
	Output,
	ViewChild,
	OnInit,
	OnDestroy
}                                         from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subject, Subscription }          from 'rxjs';
import { takeUntil }                      from 'rxjs/operators';
import Carrier                            from '@modules/server.common/entities/Carrier';
import Warehouse                          from '@modules/server.common/entities/Warehouse';
import { CarrierRouter }                  from '@modules/client.common.angular2/routers/carrier-router.service';
import { CarrierOrdersRouter }            from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { CarriersService }                from '@app/@core/data/carriers.service';
import { WarehousesService }              from '@app/@core/data/warehouses.service';
import { environment }                    from 'environments/environment';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	           selector:    'ea-carrier-tracking',
	           styleUrls:   ['carrier-tracking.component.scss'],
	           templateUrl: 'carrier-tracking.component.html',
           })
export class CarrierTrackingComponent implements OnInit, OnDestroy
{
	public carrierId: string;
	
	@ViewChild('gmap', { static: true })
	public gmapElement: any;
	
	@Output()
	public selectedStoreEmitter = new EventEmitter<Warehouse>();
	
	public map: google.maps.Map;
	public carrierSub$: any;
	public marker: any;
	public userMarker: any;
	public warehouseMarkers = [];
	public interval: NodeJS.Timer;
	public isReverted: boolean = true;
	public params$: Subscription;
	public selectedCarrier: Carrier;
	public carriers: Carrier[] = [];
	public selectedStore: Warehouse;
	public filteredCarriersList: Carrier[] = [];
	public stores: Warehouse[] = [];
	
	private ngDestroy$ = new Subject();
	
	constructor(
			private route: ActivatedRoute,
			private router: Router,
			private carrierRouter: CarrierRouter,
			private carrierOrdersRouter: CarrierOrdersRouter,
			private carriersService: CarriersService,
			private readonly _storesService: WarehousesService
	)
	{}
	
	public ngOnInit(): void
	{
		this.showMap();
		this.getCarriers();
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
		this.carriers = [];
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
	
	public getCarriers()
	{
		this._storesService
		    .getStores()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe((stores) =>
		               {
			               this.stores = stores;
			               this.carriersService
			                   .getAllCarriers()
			                   .pipe(takeUntil(this.ngDestroy$))
			                   .subscribe((carriers) =>
			                              {
				                              this.carriers = carriers.filter(
						                              (carrier) => carrier.status === 0
				                              );
				                              this.filteredCarriersList = this.carriers;
				                              this.loadDataFromUrl();
			                              });
		               });
	}
	
	public selectNewStore(id)
	{
		this.selectedStore = this.stores.find((s) => s.id === id);
	}
	
	public storeListener(e)
	{
		this.router.navigate([`carriers/track/${this.selectedStore.id}`]);
	}
	
	public carrierListener(e)
	{
		if(this.selectedStore)
		{
			this.router.navigate([
				                     `carriers/track/${this.selectedStore.id}/${this.selectedCarrier.id}`,
			                     ]);
		}
		else
		{
			this.router.navigate([
				                     `carriers/track/1/${this.selectedCarrier.id}`,
			                     ]);
		}
	}
	
	public loadDataFromUrl()
	{
		this.params$ =
				this.route.params
				    .subscribe((res: Params) =>
				               {
					               if(!res.carrierId && res.storeId)
					               {
						               this.selectNewStore(res.storeId);
						               this.filteredCarriersList = this.carriers.filter(
								               (x) => this.selectedStore.usedCarriersIds.includes(x.id)
						               );
						               this.selectedCarrier = undefined;
						               this.revertMap();
						               this._subscribeCarrier(this.filteredCarriersList);
					               }
					               else if(res.carrierId)
					               {
						               this.selectNewStore(res.storeId);
						               const filteredList = this.filteredCarriersList.filter(
								               (carrier) => carrier._id === res.carrierId
						               );
						               this.selectedCarrier = filteredList[0];
						               this.revertMap();
						               this._subscribeCarrier(filteredList);
					               }
					               else if(!res.carrierId && !res.storeId)
					               {
						               this._subscribeCarrier(this.filteredCarriersList);
					               }
				               });
	}
	
	public async _subscribeCarrier(carrierList: Carrier[])
	{
		const idArray = carrierList.map((carrier: Carrier) => carrier._id);
		idArray.forEach((c) =>
		                {
			                const carrierId = c.toString();
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
				                                                  this.map.setCenter(newCoordinates);
				                                                  const carierIcon = environment.MAP_CARRIER_ICON_LINK;
				
				                                                  const marker = this.addMarker(
						                                                  newCoordinates,
						                                                  this.map,
						                                                  carierIcon
				                                                  );
				                                                  this.warehouseMarkers.push(marker);
			                                                  });
		                });
	}
	
	public revertMap()
	{
		if(this.warehouseMarkers.length > 0)
		{
			this.warehouseMarkers.forEach((x) =>
			                              {
				                              x.setMap(null);
			                              });
			this.warehouseMarkers = [];
		}
	}
	
	public showMap()
	{
		const [lat, lng] = [environment.DEFAULT_LATITUDE, environment.DEFAULT_LONGITUDE];
		const mapProp = {
			center:    new google.maps.LatLng(lat ?? 42.642941, lng ?? 23.334149),
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
