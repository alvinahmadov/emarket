import { Component, OnDestroy, OnInit }   from '@angular/core';
import { ActivatedRoute }                 from '@angular/router';
import { LocalDataSource }                from 'ng2-smart-table';
import {
	forkJoin, Observable, Subject,
	Subscription
}                                         from 'rxjs';
import { first, takeUntil }               from 'rxjs/operators';
import { TranslateService }               from '@ngx-translate/core';
import { DomSanitizer }                   from '@angular/platform-browser';
import Warehouse                          from '@modules/server.common/entities/Warehouse';
import ProductInfo                        from '@modules/server.common/entities/ProductInfo';
import { CustomerRouter }                 from '@modules/client.common.angular2/routers/customer-router.service';
import { WarehousesService }              from '@app/@core/data/warehouses.service';
import { GeoLocationService }             from '@app/@core/data/geo-location.service';
import { ProductOrderProductsComponent }  from '@app/@shared/render-component/customer-products-table/product-order-products/product-order-products.component';
import { StoreOrderProductsComponent }    from '@app/@shared/render-component/customer-products-table/store-order-products/store-order-products.component';
import { OrderBtnOrderProductsComponent } from '@app/@shared/render-component/customer-products-table/order-btn-order-products/order-btn-order-products.component';

@Component({
	           selector:    'ea-customer-products',
	           styleUrls:   ['./ea-customer-products.scss'],
	           templateUrl: './ea-customer-products.component.html',
           })
export class CustomerProductsComponent implements OnDestroy, OnInit
{
	public settingsSmartTable: object;
	public sourceSmartTable: LocalDataSource = new LocalDataSource();
	public params$: any;
	public availableProductsSubscription$: Subscription;
	public warehouses: Warehouse[];
	public availableProducts: ProductInfo[];
	public customerId: string;
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly geoLocationProductService: GeoLocationService,
			private customerRouter: CustomerRouter,
			private readonly _router: ActivatedRoute,
			private readonly _sanitizer: DomSanitizer,
			private readonly _warehousesService: WarehousesService,
			private _translateService: TranslateService
	)
	{
		this.params$ = this._router.params.subscribe(async(res) =>
		                                             {
			                                             this.customerId = res.id;
			                                             const customer = await this.customerRouter
			                                                                        .get(this.customerId)
			                                                                        .pipe(first())
			                                                                        .toPromise();
			
			                                             if(customer == null)
			                                             {
				                                             throw new Error(`User can't be found (id: ${this.customerId})`);
			                                             }
			
			                                             this.availableProductsSubscription$ = this.geoLocationProductService
			                                                                                       .getGeoLocationProducts(customer.geoLocation)
			                                                                                       .subscribe((products: ProductInfo[]) =>
			                                                                                                  {
				                                                                                                  this.availableProducts = products;
				                                                                                                  this.sourceSmartTable.load(products);
			                                                                                                  });
		                                             });
		
		this._applyTranslationOnSmartTable();
	}
	
	public ngOnInit(): void
	{
		this._setupSmartTable();
		this._loadWarehouses();
	}
	
	public ngOnDestroy(): void
	{
		if(this.params$)
		{
			this.params$.unsubscribe();
		}
		if(this.availableProductsSubscription$)
		{
			this.availableProductsSubscription$.unsubscribe();
		}
	}
	
	private _applyTranslationOnSmartTable()
	{
		this._translateService.onLangChange.subscribe(() =>
		                                              {
			                                              this._setupSmartTable();
		                                              });
	}
	
	private _setupSmartTable()
	{
		const columnTitlePrefix = 'CUSTOMERS_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				this._translateService.get('Id'),
				getTranslate('PRODUCT'),
				getTranslate('PRICE'),
				getTranslate('STORE'),
				getTranslate('AVAILABLE_COUNT'),
				getTranslate('ORDER')
		)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe(([id, prod, price, store, availableCount, order]) =>
				           {
					           this.settingsSmartTable = {
						           actions: false,
						           columns: {
							           Product:        {
								           title:           prod,
								           type:            'custom',
								           renderComponent: ProductOrderProductsComponent,
							           },
							           Price:          {
								           title:                price,
								           type:                 'html',
								           valuePrepareFunction: (
										                                 val,
										                                 product: ProductInfo
								                                 ) =>
								                                 {
									                                 return this._sanitizer.bypassSecurityTrustHtml(
											                                 `<div class="product">
											<p>${product.warehouseProduct.price}</p>
										</div>
									</div>`
									                                 );
								                                 },
							           },
							           Store:          {
								           title:           store,
								           type:            'custom',
								           renderComponent: StoreOrderProductsComponent,
							           },
							           AvailableCount: {
								           title:                availableCount,
								           type:                 'html',
								           valuePrepareFunction: (
										                                 val,
										                                 product: ProductInfo
								                                 ) =>
								                                 {
									                                 return this._sanitizer.bypassSecurityTrustHtml(
											                                 `<div class="product">
											<p>${product.warehouseProduct.count}</p>
										</div>
									</div>`
									                                 );
								                                 },
							           },
							           Order:          {
								           title:                   order,
								           type:                    'custom',
								           renderComponent:         OrderBtnOrderProductsComponent,
								           onComponentInitFunction: async(instance) =>
								                                    {
									                                    instance.customerId = this.customerId;
									                                    instance.availableProducts = this.availableProducts;
								                                    },
							           },
						           },
						           pager:   {
							           display: true,
							           perPage: 3,
						           },
					           };
				           });
	}
	
	private async _loadWarehouses()
	{
		this.warehouses = await this._warehousesService
		                            .getStores()
		                            .pipe(first())
		                            .toPromise();
	}
}
