import {
	Component, Input,
	OnInit, OnDestroy
}                                           from '@angular/core';
import { ModalOptions }                     from '@ionic/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Subscription }                     from 'rxjs';
import { NgxMasonryOptions }                from 'ngx-masonry';
import Product                              from '@modules/server.common/entities/Product';
import WarehouseProduct                     from '@modules/server.common/entities/WarehouseProduct';
import { ILocaleMember }                    from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService }            from '@modules/client.common.angular2/locale/product-locales.service';
import { CreateProductTypePopupPage }       from 'pages/+warehouse/create-product-type-popup/create-product-type-popup';
import { EditProductTypePopupPage }         from 'pages/+warehouse/edit-product-type-popup/edit-product-type-popup';
import { WarehouseProductsService }         from 'services/warehouse-products.service';

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
	public getWarehouseProductImageUrl: (p: Product) => string;
	
	@Input()
	public truncateTitle: (title: string) => string;
	
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
			public alertController: AlertController,
			private modalCtrl: ModalController,
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
								                                                     isProductAvailable: p.isProductAvailable,
								                                                     isManufacturing:    p.isManufacturing,
								                                                     isCarrierRequired:  p.isCarrierRequired,
								                                                     isDeliveryRequired: p.isCarrierRequired,
								                                                     isTakeaway:         p.isTakeaway,
								                                                     _createdAt:         p._createdAt,
								                                                     _updatedAt:         p._updatedAt,
								                                                     price:              p.price,
								                                                     rating:             p.rating,
								                                                     promotion:          p.promotion,
								                                                     comments:           p.comments,
								                                                     initialPrice:       p.initialPrice,
							                                                     })
			                                );
			
			                                this.page = page;
		                                });
	}
	
	public addProduct(warehouseProduct: WarehouseProduct): void
	{
		
		this.warehouseProductsService.increaseCount(
				this.warehouseId,
				warehouseProduct.productId,
				1
		);
	}
	
	public removeProduct(warehouseProduct: WarehouseProduct): void
	{
		this.warehouseProductsService.decreaseCount(
				this.warehouseId,
				(warehouseProduct.productId),
				1
		);
	}
	
	public deleteProduct(warehouseProduct: WarehouseProduct): void
	{
		const product = warehouseProduct.product as Product;
		const productTitle = this.localeTranslate(product.title);
		
		this.presentAlert(
				"Удалить?",
				`Товар ${productTitle}`,
				"Уверены, что хотите удалить товар?"
		).then(
				result =>
				{
					if(result.role === 'ok')
					{
						const productIds: string[] = [warehouseProduct.productId]
						this.warehouseProductsService.remove(
								this.warehouseId,
								productIds
						);
					}
				}
		)
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		if(member !== undefined)
		{
			return this.translateProductLocales.getTranslate(member);
		}
	}
	
	public presentCreateProductPopover()
	{
		const modalOptions = {
			component:       CreateProductTypePopupPage,
			backdropDismiss: true,
			cssClass:        'mutation-product-modal',
		};
		
		try
		{
			this.modalCtrl.create(modalOptions)
			    .then(modal => modal.present())
		} catch(e)
		{
			console.error(e)
		}
	}
	
	public openEditProductModal(product: WarehouseProduct): void
	{
		const modalOptions: ModalOptions = {
			component:       EditProductTypePopupPage,
			backdropDismiss: true,
			componentProps:  { warehouseProduct: product },
			cssClass:        'mutation-product-modal',
		}
		
		this.modalCtrl.create(modalOptions).then(
				(modal) => modal.present()
		);
	}
	
	async presentAlert(
			header: string    = "Confirm!",
			subHeader: string = "Subtitle",
			message: string   = "Message <strong>text</strong>!!!"
	)
	{
		const alert = await this.alertController.create({
			                                                cssClass: 'my-custom-class',
			                                                header,
			                                                message,
			                                                buttons:  [
				                                                {
					                                                text:     'Отменить',
					                                                role:     'cancel',
					                                                cssClass: 'secondary'
				                                                },
				                                                {
					                                                text: 'Ok',
					                                                role: 'ok'
				                                                }
			                                                ]
		                                                });
		
		await alert.present();
		return alert.onDidDismiss();
	}
}
