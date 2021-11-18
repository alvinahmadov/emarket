import { Component, OnDestroy, OnInit, ViewChild, }   from '@angular/core';
import { Router }                                     from '@angular/router';
import { Subject }                                    from 'rxjs';
import { debounceTime, distinctUntilChanged, first, } from 'rxjs/operators';
import { ILocation }                                  from '@modules/server.common/interfaces/IGeoLocation';
import ProductInfo                                    from '@modules/server.common/entities/ProductInfo';
import Warehouse                                      from '@modules/server.common/entities/Warehouse';
import GeoLocation                                    from '@modules/server.common/entities/GeoLocation';
import { CustomerRouter }                             from '@modules/client.common.angular2/routers/customer-router.service';
import { StorageService }                             from 'app/services/storage';
import { GeoLocationService }                         from 'app/services/geo-location';
import { GeoLocationProductsService }                 from 'app/services/geo-location-products';
import { GeoLocationWarehousesService }               from 'app/services/geo-location-warehouses';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { CarouselViewComponent }                      from './views/carousel/carousel-view.component';
import { WarehousesService }                          from 'app/services/warehouses';

// import { environment }                                from 'environments/environment';

@Component({
	           selector:    'warehouses',
	           styleUrls:   ['./warehouses.component.scss'],
	           templateUrl: './warehouses.component.html',
           })
export class WarehousesComponent implements OnInit, OnDestroy
{
	@ViewChild('carouselView')
	public carouselView: CarouselViewComponent;
	
	public products: ProductInfo[] = [];
	public warehouses: Warehouse[] = [];
	
	public warehousesLoading: boolean = true;
	public searchModel: string;
	public searchText: string;
	public modelChanged: Subject<string> = new Subject<string>();
	public isWideView: boolean;
	
	private getOrdersGeoObj: { loc: ILocation };
	private warehousesCount: number = 0;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly router: Router,
			private readonly storageService: StorageService,
			private readonly customerRouter: CustomerRouter,
			private readonly warehousesService: WarehousesService,
			private readonly geoLocationService: GeoLocationService,
			private readonly geoLocationProductsService: GeoLocationProductsService,
			private readonly geoLocationWarehousesService: GeoLocationWarehousesService
	)
	{
		this.isWideView = this.storageService.productListViewSpace === 'wide';
		this.loadGeoLocationWarehouses()
		this.warehousesFilter();
	}
	
	public ngOnInit()
	{}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get isListView()
	{
		return this.storageService.productViewType !== 'carousel';
	}
	
	public warehousesFilter()
	{
		this.modelChanged
		    .pipe(
				    debounceTime(1000),
				    distinctUntilChanged()
		    )
		    .subscribe(async(text) =>
		               {
			               this.searchText = text;
			               this.warehouses = [];
			               this.warehousesLoading = true;
			
			               if(this.carouselView)
			               {
				               this.carouselView.currentIndex = 0;
			               }
			
			               await this.loadWarehouses();
		               });
	}
	
	public changedProducts(text: string)
	{
		this.modelChanged.next(text);
	}
	
	public changedWarehouses(text: string)
	{
		this.modelChanged.next(text);
	}
	
	private async loadGeoLocationWarehouses()
	{
		let geoLocationForWarehouses: GeoLocation;
		
		const isProductionEnv = true //environment.production;
		if(this.storageService.customerId && isProductionEnv)
		{
			const customer = await this.customerRouter
			                           .get(this.storageService.customerId)
			                           .pipe(first())
			                           .toPromise();
			
			geoLocationForWarehouses = customer.geoLocation;
		}
		else
		{
			geoLocationForWarehouses = await this.geoLocationService.getCurrentGeoLocation();
		}
		
		this.getOrdersGeoObj = {
			loc: {
				type:        'Point',
				coordinates: geoLocationForWarehouses.loc.coordinates,
			},
		};
		await this.loadWarehouses();
	}
	
	public async loadWarehouses()
	{
		this.warehousesLoading = true;
		await this.loadWarehousesCount();
		
		let warehouses: Warehouse[];
		
		// Load nearby warehouses
		if(this.getOrdersGeoObj)
		{
			const options = {
				fullProducts: true,
				activeOnly:   true
			}
			
			warehouses = await this.geoLocationWarehousesService
			                       .geoLocationWarehouses(this.getOrdersGeoObj, options)
			                       .pipe(first())
			                       .toPromise();
		}
		else // Load all warehouses
		{
			warehouses = await this.warehousesService.getWarehouses();
		}
		
		if(warehouses)
			this.warehouses.push(...warehouses);
		
		this.warehousesLoading = false;
	}
	
	private async loadWarehousesCount()
	{
		if(this.getOrdersGeoObj)
		{
			let warehouses = await this.geoLocationWarehousesService
			                           .geoLocationWarehouses(
					                           this.getOrdersGeoObj,
					                           { fullProducts: false, activeOnly: true })
			                           .toPromise();
			
			this.warehousesCount = warehouses.length
		}
		else
		{
			this.warehousesCount = await this.warehousesService.getWarehousesCount();
		}
		
	}
}
