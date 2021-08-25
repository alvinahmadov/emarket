import { Component, OnInit, OnDestroy, Input, ElementRef } from '@angular/core';
import { WarehouseProductsService }                        from '../../../services/warehouse-products.service';
import { Subscription }                                    from 'rxjs';
import WarehouseProduct                                    from '@modules/server.common/entities/WarehouseProduct';
import { ILocaleMember }                                   from "@modules/server.common/interfaces/ILocale";
import { ProductLocalesService }                           from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseProductsRouter }                         from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import Product                                             from '@modules/server.common/entities/Product';
import { NgxMasonryOptions }                               from 'ngx-masonry';
import { ModalController }                                 from '@ionic/angular';

@Component({
	           selector: 'merchant-all-products',
	           templateUrl: 'all-products.component.html',
	           styleUrls: ['all-products.component.scss'],
           })
export class AllProductsComponent implements OnInit, OnDestroy
{
	@Input()
	warehouseId: string;
	
	@Input()
	presentCreateProductPopover: () => void;
	
	@Input()
	addProduct: (string) => void;
	
	@Input()
	removeProduct: (string) => void;
	
	@Input()
	getWarehouseProductImageUrl: (p: Product) => string;
	
	@Input()
	openEditProductModal: (p: any) => Promise<void>;
	
	@Input()
	truncateTitle: (title: string) => string;
	
	@Input()
	localeTranslate: (locale: ILocaleMember[]) => string;
	
	private products$: Subscription;
	
	allProducts: WarehouseProduct[] = [];
	
	public masonryOptions: NgxMasonryOptions = {
		itemSelector: '.masonry-item',
		columnWidth: 234,
		transitionDuration: '0.2s',
		gutter: 10,
		resize: true,
		initLayout: true,
		fitWidth: true,
	};
	
	page: number = 1;
	productsCount: number;
	paginationCount: number = 10;
	
	updateMasonryLayout: boolean = false;
	showNoProductsIcon: boolean = false;
	
	constructor(
			private warehouseProductsService: WarehouseProductsService,
			private translateProductLocales: ProductLocalesService,
			private warehouseProductsRouter: WarehouseProductsRouter,
			private modalCtrl: ModalController
	)
	{}
	
	async ngOnInit()
	{
		this.warehouseProductsService
		    .getProductsCount(this.warehouseId)
		    .then((count) =>
		          {
			          count === 0
			          ? (this.showNoProductsIcon = true)
			          : (this.showNoProductsIcon = false);
			          this.productsCount = count;
		          });
		this.loadPage(this.page);
	}
	
	loadPage(page: number)
	{
		if(this.products$)
		{
			this.products$.unsubscribe();
		}
		
		this.products$ = this.warehouseProductsService
		                     .getProductsWithPagination(this.warehouseId, {
			                     skip: (page - 1) * 10,
			                     limit: 10,
		                     })
		                     .subscribe((products) =>
		                                {
			                                this.updateMasonryLayout = true;
			
			                                this.allProducts = products.map(
					                                (p) =>
							                                new WarehouseProduct({
								                                                     _id: p._id,
								                                                     count: p.count,
								                                                     product: p.product,
								                                                     isManufacturing: p.isManufacturing,
								                                                     isCarrierRequired: p.isCarrierRequired,
								                                                     isDeliveryRequired: p.isCarrierRequired,
								                                                     isTakeaway: p.isTakeaway,
								                                                     _createdAt: p._createdAt,
								                                                     _updatedAt: p._updatedAt,
								                                                     price: p.price,
								                                                     initialPrice: p.initialPrice,
							                                                     })
			                                );
			
			                                this.page = page;
		                                });
	}
	
	ngOnDestroy()
	{
		if(this.products$)
		{
			this.products$.unsubscribe();
		}
	}
}
