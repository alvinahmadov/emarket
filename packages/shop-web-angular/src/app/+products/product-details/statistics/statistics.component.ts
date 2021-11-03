import {
	Component, Input,
	OnInit, OnDestroy
}                                  from '@angular/core';
import { Subject }                 from 'rxjs';
import { map }                     from 'rxjs/operators';
import { ILocaleMember }           from '@modules/server.common/interfaces/ILocale';
import { IProductsCategory }       from '@modules/server.common/interfaces/IProductsCategory';
import IWarehouse                  from '@modules/server.common/interfaces/IWarehouse';
import Currency                    from '@modules/server.common/entities/Currency';
import Product                     from '@modules/server.common/entities/Product';
import WarehouseProduct            from '@modules/server.common/entities/WarehouseProduct';
import { ProductLocalesService }   from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { CurrenciesService }       from 'app/services/currencies.service';
import { StorageService }          from 'app/services/storage';
import { ProductCategoryService }  from 'app/services/product-category.service';

@Component({
	           selector:    'es-statistics',
	           templateUrl: './statistics.component.html',
	           styleUrls:   ['./statistics.component.scss']
           })
export class StatisticsComponent implements OnInit, OnDestroy
{
	@Input()
	public warehouseProduct: WarehouseProduct;
	
	@Input()
	public warehouseId: string;
	
	public customerId: string;
	
	public categories: IProductsCategory[] = null;
	
	public warehouse: IWarehouse;
	public currency: Currency;
	
	private _ngDestroy$: Subject<void> = new Subject<void>();
	
	constructor(
			private readonly _productLocalesService: ProductLocalesService,
			private readonly _currenciesService: CurrenciesService,
			private readonly _productCategoryService: ProductCategoryService,
			private readonly _warehouseProductRouter: WarehouseProductsRouter,
			private readonly storage: StorageService
	)
	{
		this.customerId = this.storage.customerId;
	}
	
	public ngOnInit(): void
	{
		const code = this.storage.defaultCurrency ?? 'RUB';
		this._currenciesService
		    .getCurrencies()
		    .pipe(map(currencies => currencies.find(c => c.code === code)))
		    .subscribe((curr) => this.currency = curr);
		
		if(this.warehouseProduct !== undefined)
		{
			if(!this.categories)
			{
				(<Product>this.warehouseProduct.product)
						.categories
						.forEach((categoryId) =>
						         {
							         if(typeof categoryId === 'string')
							         {
								         if(this.categories === null)
									         this.categories = [];
								         this._productCategoryService
								             .getCategory(categoryId)
								             .subscribe(category => this.categories.push(category))
							         }
						         })
				
			}
		}
	}
	
	public ngOnDestroy(): void
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	public get hasDiscount(): boolean
	{
		return this.getDiscount() > 0;
	}
	
	public getDiscount()
	{
		if(
				!this.warehouseProduct ||
				!this.warehouseProduct.initialPrice ||
				this.warehouseProduct.price === this.warehouseProduct.initialPrice
		)
		{
			return 0;
		}
		
		return Math.floor(
				(1 - this.warehouseProduct.price / this.warehouseProduct.initialPrice) *
				100
		);
	}
}
