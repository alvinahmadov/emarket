import {
	Component,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	ViewChild,
}                                from '@angular/core';
import { TranslateService }      from '@ngx-translate/core';
import { Observable, Subject }   from 'rxjs';
import { takeUntil }             from 'rxjs/operators';
import { ILocaleMember }         from '@modules/server.common/interfaces/ILocale';
import OrderWarehouseStatus      from '@modules/server.common/enums/OrderWarehouseStatus';
import DeliveryType              from '@modules/server.common/enums/DeliveryType';
import Order                     from '@modules/server.common/entities/Order';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { OrderRouter }           from '@modules/client.common.angular2/routers/order-router.service';
import { environment }           from 'environments/environment';

interface ISlideImage
{
	caption: string;
	style: {
		height?: string
	};
	title: string;
	url: string
}

@Component({
	           selector:    'ea-warehouse-order-view',
	           styleUrls:   ['./warehouse-order-view.component.scss'],
	           templateUrl: './warehouse-order-view.component.html',
           })
export class WarehouseOrderViewComponent
		implements OnInit, OnDestroy, OnChanges
{
	@Input()
	selectedOrder: Order;
	@Input()
	hideHeader: boolean;
	@ViewChild('slideshow', { static: true })
	slideshow: any;
	
	isSelectedOrderActionsAvailable: boolean = true;
	loading: boolean;
	QTY: string;
	slideImages: ISlideImage[];
	orderTypeDelivery: DeliveryType = DeliveryType.Delivery;
	orderTypeTakeaway: DeliveryType = DeliveryType.Takeaway;
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private orderRouter: OrderRouter,
			private _productLocalesService: ProductLocalesService,
			private readonly translateService: TranslateService
	)
	{
		this._applyTranslationOnSmartTable();
	}
	
	ngOnChanges()
	{
		this.selectedOrder.products.map((p) =>
				                                p.product.images.sort((i1, i2) => i2.orientation - i1.orientation)
		);
		
		if(this.slideshow && this.selectedOrder.products.length === 1)
		{
			this.slideshow.goToSlide(0);
		}
		this.getSlideImage();
	}
	
	ngOnInit() {}
	
	takeSlidebarTranslates()
	{
		const columnTitlePrefix = 'ORDER_VIEW.ORDER_SIDEBAR.';
		const getTranslatedWord = (name: string): Observable<string | any> =>
				this.translateService.get(columnTitlePrefix + name);
		getTranslatedWord('QTY')
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((tr) =>
				           {
					           this.QTY = tr;
				           });
	}
	
	getSlideImage()
	{
		this.slideImages = this.selectedOrder
		                       .products
		                       .map((p) =>
		                            {
			                            const productTitle = this._productLocalesService.getTranslate(
					                            p.product.title
			                            );
			                            const productCount = p.count;
			                            const productPrice = p.price;
			
			                            this.takeSlidebarTranslates();
			                            //TODO: Add dynamic currency symbol
			                            return {
				                            url:     this._productLocalesService.getTranslate(p.product.images),
				                            caption: `${productTitle} (${environment.CURRENCY_SYMBOL + ' ' + productPrice},
				                            ${this.QTY}: ${productCount})`,
				                            title:   this._productLocalesService.getTranslate(
						                            p.product.description
				                            ),
				                            style:   {
					                            height: '100%',
				                            },
			                            };
		                            });
	}
	
	async updateOrderWarehouseStatus(status: OrderWarehouseStatus)
	{
		this.isSelectedOrderActionsAvailable = false;
		this.loading = true;
		await this.orderRouter.updateWarehouseStatus(
				this.selectedOrder.id,
				status
		);
		this.selectedOrder.warehouseStatus = status;
		
		this.isSelectedOrderActionsAvailable = true;
		this.loading = false;
	}
	
	ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	protected localeTranslate(member: ILocaleMember[])
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	private _applyTranslationOnSmartTable()
	{
		this.translateService.onLangChange.subscribe(() =>
		                                             {
			                                             this.takeSlidebarTranslates();
		                                             });
	}
}
