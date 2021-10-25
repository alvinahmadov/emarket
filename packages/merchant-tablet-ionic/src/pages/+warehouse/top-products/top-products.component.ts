import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }                        from 'rxjs';
import { ILocaleMember }                       from '@modules/server.common/interfaces/ILocale';
import Product                                 from '@modules/server.common/entities/Product';
import WarehouseProduct                        from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseProductsRouter }             from '@modules/client.common.angular2/routers/warehouse-products-router.service';

@Component({
	           selector:    'merchant-top-products',
	           templateUrl: 'top-products.component.html',
	           styleUrls:   ['../common/no-orders-info/no-orders-info.component.scss'],
           })
export class TopProductsComponent implements OnInit, OnDestroy
{
	@Input()
	public warehouseId: string;
	
	@Input()
	public presentCreateProductPopover: () => Promise<void>;
	
	@Input()
	public addProduct: (productId: string) => Promise<WarehouseProduct>;
	
	@Input()
	public getWarehouseProductImageUrl: (product: Product) => string;
	
	@Input()
	public openEditProductModal: (product: any) => Promise<void>;
	
	@Input()
	public truncateTitle: (title: string) => string;
	
	@Input()
	public localeTranslate: (member: ILocaleMember[]) => string;
	
	public topProducts$: Subscription;
	public topProducts: WarehouseProduct[] = [];
	
	public showNoProductsIcon: boolean = false;
	
	constructor(private warehouseProductsRouter: WarehouseProductsRouter)
	{}
	
	public ngOnInit()
	{
		if(this.topProducts$)
		{
			this.topProducts$.unsubscribe();
		}
		
		this.topProducts$ = this.warehouseProductsRouter
		                        .getTopProducts(this.warehouseId, 20)
		                        .subscribe((products) =>
		                                   {
			                                   this.showNoProductsIcon = products.length === 0;
			                                   this.topProducts = products;
		                                   });
	}
	
	public ngOnDestroy()
	{
		if(this.topProducts$)
		{
			this.topProducts$.unsubscribe();
		}
	}
}
