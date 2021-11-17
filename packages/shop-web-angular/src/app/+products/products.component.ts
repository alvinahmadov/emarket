import {
	Component, ViewChild,
	OnDestroy, OnInit
}                                     from '@angular/core';
import { Router }                     from '@angular/router';
import { Subject }                    from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged,
	first
}                                     from 'rxjs/operators';
import { ILocation }                  from '@modules/server.common/interfaces/IGeoLocation';
import RegistrationSystem             from '@modules/server.common/enums/RegistrationSystem';
import DeliveryType                   from '@modules/server.common/enums/DeliveryType';
import { IOrderCreateInput }          from '@modules/server.common/routers/IWarehouseOrdersRouter';
import GeoLocation                    from '@modules/server.common/entities/GeoLocation';
import ProductInfo                    from '@modules/server.common/entities/ProductInfo';
import WarehouseProduct               from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseOrdersRouter }      from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { CustomerRouter }             from '@modules/client.common.angular2/routers/customer-router.service';
import { GeoLocationService }         from 'app/services/geo-location';
import { GeoLocationProductsService } from 'app/services/geo-location-products';
import { ProductsService }            from 'app/services/products.service';
import { WarehouseProductsService }   from 'app/services/warehouse-products.service';
import { StorageService }             from 'app/services/storage';
import { environment }                from 'environments/environment';
import { CarouselViewComponent }      from './views/carousel/carousel-view.component';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

const initializeProductsNumber: number = 10;

@Component({
	           selector:    'products',
	           styleUrls:   ['./products.component.scss'],
	           templateUrl: './products.component.html',
           })
export class ProductsComponent implements OnInit, OnDestroy
{
	@ViewChild('carouselView')
	public carouselView: CarouselViewComponent;
	
	public products: ProductInfo[] = [];
	public productsLoading: boolean = true;
	public searchModel: string;
	public searchText: string;
	public modelChanged: Subject<string> = new Subject<string>();
	public isWideView: boolean;
	
	private getOrdersGeoObj: { loc: ILocation };
	private productsCount: number;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly router: Router,
			private readonly customerRouter: CustomerRouter,
			private readonly storageService: StorageService,
			private readonly geoLocationService: GeoLocationService,
			private readonly geoLocationProductsService: GeoLocationProductsService,
			private readonly productsService: ProductsService,
			private readonly warehouseProductsService: WarehouseProductsService,
			private readonly warehouseOrdersRouter: WarehouseOrdersRouter
	)
	{
		this.isWideView = this.storageService.productListViewSpace === 'wide';
		this.loadGeoLocationProducts();
		this.productsFilter();
	}
	
	public ngOnInit()
	{
		if(this.products)
		{
			this.continueOrder();
		}
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get isListView()
	{
		return this.storageService.productViewType !== 'carousel';
	}
	
	public productsFilter()
	{
		this.modelChanged
		    .pipe(
				    debounceTime(1000), // wait 500ms after the last event before emitting last event
				    distinctUntilChanged() // only emit if value is different from previous valuetakeUntil(this._ngDestroy$))
		    )
		    .subscribe(async(text) =>
		               {
			               this.searchText = text;
			               this.products = [];
			               this.productsLoading = true;
			
			               if(this.carouselView)
			               {
				               this.carouselView.currentIndex = 0;
			               }
			
			               await this.loadProducts();
		               });
	}
	
	public changedProducts(text: string)
	{
		this.modelChanged.next(text);
	}
	
	private async buyItem(currentProduct: WarehouseProduct, warehouseId: string)
	{
		const orderCreateInput: IOrderCreateInput = {
			warehouseId,
			orderType:  this.storageService.deliveryType,
			products:   [{ count: 1, productId: currentProduct.product['id'] }],
			customerId: this.storageService.customerId,
			options:    { autoConfirm: false },
		};
		
		await this.warehouseOrdersRouter.create(orderCreateInput);
		
		await this.router.navigate(['/orders']);
	}
	
	private async continueOrder()
	{
		const buyProductId = this.storageService.buyProductId;
		
		if(buyProductId)
		{
			const customerId = this.storageService.customerId;
			const merchantId = this.storageService.merchantId;
			
			if(customerId && merchantId)
			{
				const productForBuy =
						      await this.warehouseProductsService
						                .getWarehouseProduct(merchantId, buyProductId);
				
				if(productForBuy)
				{
					await this.buyItem(productForBuy, merchantId);
					this.storageService.buyProductId = null;
					this.storageService.merchantId = null;
				}
			}
			else
			{
				this.storageService.buyProductId = null;
				this.storageService.merchantId = null;
			}
		}
	}
	
	private async loadGeoLocationProducts()
	{
		let geoLocationForProducts: GeoLocation;
		
		const isProductionEnv = environment.production;
		
		if(this.storageService.customerId && isProductionEnv)
		{
			const customer = await this.customerRouter
			                           .get(this.storageService.customerId)
			                           .pipe(first())
			                           .toPromise();
			
			geoLocationForProducts = customer.geoLocation;
		}
		else
		{
			try
			{
				geoLocationForProducts = await this.geoLocationService.getCurrentGeoLocation();
			} catch(error)
			{
				console.warn(error);
			}
		}
		
		this.getOrdersGeoObj = {
			loc: {
				type:        'Point',
				coordinates: geoLocationForProducts.loc.coordinates,
			},
		};
		
		await this.loadProducts();
	}
	
	public async loadProducts(count?: number)
	{
		this.productsLoading = true;
		await this.loadProductsCount();
		
		if(this.productsCount > this.products.length)
		{
			if(this.getOrdersGeoObj)
			{
				const isDeliveryRequired =
						      this.storageService.deliveryType === DeliveryType.Delivery;
				const isTakeaway =
						      this.storageService.deliveryType === DeliveryType.Takeaway;
				
				const products: ProductInfo[] = await this.geoLocationProductsService
				                                          .geoLocationProductsByPaging(
						                                          this.getOrdersGeoObj,
						                                          {
							                                          skip:  this.products.length,
							                                          limit: count
							                                                 ? count
							                                                 : initializeProductsNumber,
						                                          },
						                                          {
							                                          isDeliveryRequired,
							                                          isTakeaway
						                                          },
						                                          this.searchText
				                                          )
				                                          .pipe(first())
				                                          .toPromise();
				
				this.products.push(...products);
			}
			else
			{
				this.storageService.registrationSystem = RegistrationSystem.Once;
				this.router.navigate(['/auth'])
				    .catch(err => console.error(err));
			}
		}
		this.productsLoading = false;
	}
	
	private async loadProductsCount()
	{
		const isDeliveryRequired =
				      this.storageService.deliveryType === DeliveryType.Delivery;
		const isTakeaway =
				      this.storageService.deliveryType === DeliveryType.Takeaway;
		
		if(this.getOrdersGeoObj)
		{
			this.productsCount = await this.geoLocationProductsService.getCountOfGeoLocationProducts(
					this.getOrdersGeoObj,
					{ isDeliveryRequired, isTakeaway },
					this.searchText
			);
		}
		else
		{
			const locale = this.storageService.locale.split('-')[0];
			this.productsCount = await this.productsService
			                               .getCountOfProducts(
					                               {
						                               'title.value':       {
							                               $text: {
								                               $search:        this.searchText,
								                               $caseSensitive: false,
								                               $language:      locale
							                               }
						                               },
						                               'description.value': {
							                               $text: {
								                               $search:        this.searchText,
								                               $caseSensitive: false,
								                               $language:      locale
							                               }
						                               },
					                               }
			                               );
		}
	}
}
