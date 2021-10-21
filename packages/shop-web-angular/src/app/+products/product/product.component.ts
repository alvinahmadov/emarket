import {
	Component,
	EventEmitter,
	Inject,
	Input,
	Output,
	OnChanges
}                                                      from '@angular/core';
import { DOCUMENT }                                    from '@angular/common';
import { Router }                                      from '@angular/router';
import { animate, state, style, transition, trigger, } from '@angular/animations';
import { Observable }                                  from 'rxjs';
import { ElementQueries }                              from 'css-element-queries/src/ElementQueries';
import ProductInfo                                     from '@modules/server.common/entities/ProductInfo';
import { OrderRouter }                                 from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter }                       from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { ProductLocalesService }                       from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember }                               from '@modules/server.common/interfaces/ILocale';
import RegistrationSystem                              from '@modules/server.common/enums/RegistrationSystem';
import { IProductImage }                               from '@modules/server.common/interfaces/IProduct';
import { StorageService }                              from 'app/services/storage';

@Component({
	           selector:    'product',
	           animations:  [
		           trigger('show', [
			           state('shown', style({ opacity: 1 })),
			           state('hidden', style({ opacity: 0 })),
			           transition('shown <=> hidden', animate('.2s')),
		           ]),
	           ],
	           styleUrls:   ['./product.component.scss'],
	           templateUrl: './product.component.html',
           })
export class ProductComponent implements OnChanges
{
	@Output()
	public load: EventEmitter<void> = new EventEmitter<void>();
	
	@Input()
	public info: ProductInfo;
	
	public showTitle: 'shown' | 'hidden' = 'hidden';
	public isGridView: boolean;
	public productImage: IProductImage;
	
	@Input()
	private layoutComplete: Observable<void>;
	
	constructor(
			@Inject(DOCUMENT) public document: Document,
			private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
			private readonly orderRouter: OrderRouter,
			private readonly router: Router,
			private readonly _productLocalesService: ProductLocalesService,
			private readonly storage: StorageService
	)
	{
		this.isGridView = this.storage.productListViewType === 'grid';
	}
	
	public ngOnChanges(): void
	{
		if(this.info)
		{
			this.productImage = this.info.warehouseProduct.product[
					'images'
					].find((i: IProductImage) =>
					       {
						       return (
								       i.url ===
								       this.localeTranslate(this.info.warehouseProduct.product['images'])
						       );
					       });
		}
	}
	
	public onImageLoad(): void
	{
		if(ElementQueries)
		{
			ElementQueries.init();
		}
		
		this.load.emit();
		this.showTitle = 'shown';
	}
	
	public onLayoutComplete(): void
	{
		return;
	}
	
	public async createOrder(): Promise<void>
	{
		if(
				!this.storage.userId &&
				this.storage.registrationSystem === RegistrationSystem.Disabled
		)
		{
			this.storage.registrationSystem = RegistrationSystem.Once;
			this.storage.buyProductId = this.info.warehouseProduct.id;
			this.storage.merchantId = this.info.warehouseId;
			this.router.navigate(['/login']).catch(console.error);
		}
		else
		{
			const userId = this.storage.userId;
			
			const order = await this.warehouseOrdersRouter.createByProductType(
					userId,
					this.info.warehouseId,
					this.info.warehouseProduct.product['id'],
					this.storage.deliveryType
			);
			
			await this.orderRouter.confirm(order.id);
			
			this.router.navigate(['/orders']).catch(console.error);
		}
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	private resizeWorks(): void
	{
		/*Observable.fromEvent(this.titleElement.nativeElement, 'resize');
		 https://stackoverflow.com/questions/39084250/how-to-get-width-of-dom-element-in-angular2
		 https://stackoverflow.com/questions/37770226/observable-from-button-click-event-in-angular2*/
	}
}
