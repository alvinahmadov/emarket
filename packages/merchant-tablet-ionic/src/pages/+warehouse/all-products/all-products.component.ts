import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }                        from 'rxjs';
import { NgxMasonryOptions }                   from 'ngx-masonry';
import { ModalController }                     from '@ionic/angular';
import Product                                 from '@modules/server.common/entities/Product';
import WarehouseProduct                        from '@modules/server.common/entities/WarehouseProduct';
import { ILocaleMember }                       from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService }               from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseProductsRouter }             from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { WarehouseProductsService }            from 'services/warehouse-products.service';

@Component({
	           selector:    'merchant-all-products',
	           styleUrls:   ['./all-products.component.scss'],
	           templateUrl: './all-products.component.html',
           })
export class AllProductsComponent implements OnInit, OnDestroy
{
	@Input()
	public warehouseId: string;
	
	@Input()
	public presentCreateProductPopover: () => void;
	
	@Input()
	public addProduct: (string) => void;
	
	@Input()
	public removeProduct: (string) => void;
	
	@Input()
	public getWarehouseProductImageUrl: (p: Product) => string;
	
	@Input()
	public openEditProductModal: (p: any) => Promise<void>;
	
	@Input()
	public truncateTitle: (title: string) => string;
	
	@Input()
	public localeTranslate: (locale: ILocaleMember[]) => string;
	
	private products$: Subscription;
	
	public allProducts: WarehouseProduct[] = [];
	
	public masonryOptions: NgxMasonryOptions = {
		itemSelector:       '.masonry-item',
		columnWidth:        234,
		transitionDuration: '0.2s',
		gutter:             10,
		resize:             true,
		initLayout:         true,
		fitWidth:           true,
	};
	
	public page: number = 1;
	public productsCount: number;
	public paginationCount: number = 10;
	
	public updateMasonryLayout: boolean = false;
	public showNoProductsIcon: boolean = false;
	
	constructor(
			private warehouseProductsService: WarehouseProductsService,
			private translateProductLocales: ProductLocalesService,
			private warehouseProductsRouter: WarehouseProductsRouter,
			private modalCtrl: ModalController
	)
	{}
	
	public ngOnInit()
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
	
	public ngOnDestroy()
	{
		if(this.products$)
		{
			this.products$.unsubscribe();
		}
	}
	
	public loadPage(page: number)
	{
		if(this.products$)
		{
			this.products$.unsubscribe();
		}
		
		this.products$ = this.warehouseProductsService
		                     .getProductsWithPagination(this.warehouseId, {
			                     skip:  (page - 1) * 10,
			                     limit: 10,
		                     })
		                     .subscribe((products) =>
		                                {
			                                this.updateMasonryLayout = true;
			
			                                this.allProducts = products.map(
					                                (p) =>
							                                new WarehouseProduct({
								                                                     _id:                p._id,
								                                                     count:              p.count,
								                                                     product:            p.product,
								                                                     isManufacturing:    p.isManufacturing,
								                                                     isCarrierRequired:  p.isCarrierRequired,
								                                                     isDeliveryRequired: p.isCarrierRequired,
								                                                     isTakeaway:         p.isTakeaway,
								                                                     _createdAt:         p._createdAt,
								                                                     _updatedAt:         p._updatedAt,
								                                                     price:              p.price,
								                                                     initialPrice:       p.initialPrice,
							                                                     })
			                                );
			
			                                this.page = page;
		                                });
	}
}
