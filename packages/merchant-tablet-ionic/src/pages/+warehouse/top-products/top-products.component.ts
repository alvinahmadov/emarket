import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }                        from 'rxjs';
import { ILocaleMember }                       from '@modules/server.common/interfaces/ILocale';
import Product                                 from '@modules/server.common/entities/Product';
import WarehouseProduct                        from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseProductsRouter }             from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ModalController }                     from "@ionic/angular";
import { CreateProductTypePopupPage }          from "pages/+warehouse/create-product-type-popup/create-product-type-popup";
import { EditProductTypePopupPage }            from "pages/+warehouse/edit-product-type-popup/edit-product-type-popup";
import { ModalOptions }                        from "@ionic/core";

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
	public addProduct: (productId: string) => Promise<WarehouseProduct>;
	
	@Input()
	public getWarehouseProductImageUrl: (product: Product) => string;
	
	@Input()
	public truncateTitle: (title: string) => string;
	
	@Input()
	public localeTranslate: (member: ILocaleMember[]) => string;
	
	public topProducts$: Subscription;
	public topProducts: WarehouseProduct[] = [];
	
	public showNoProductsIcon: boolean = false;
	
	constructor(
			private warehouseProductsRouter: WarehouseProductsRouter,
			public modalController: ModalController
	)
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
	
	public async presentCreateProductPopover(): Promise<void>
	{
		try
		{
			const modalOptions: ModalOptions = {
				component:       CreateProductTypePopupPage,
				backdropDismiss: true,
				cssClass:        'mutation-product-modal',
			};
			
			const modal = await this.modalController.create(modalOptions);
			
			await modal.present();
		} catch(e)
		{
			console.error(e.stack);
			console.error(e.message);
		}
	}
	
	public openEditProductModal(product: WarehouseProduct): void
	{
		const modalOptions: ModalOptions = {
			component:       EditProductTypePopupPage,
			backdropDismiss: true,
			componentProps:  { warehouseProduct: product },
			cssClass:        'mutation-product-modal',
		};
		
		this.modalController.create(modalOptions).then(modal => modal.present);
	}
}
