import { Component, Input, OnInit, NgZone, Inject } from '@angular/core';
import { DOCUMENT }                                 from '@angular/common';
import { Router }                                   from '@angular/router';
import { MatDialog }                                from '@angular/material/dialog';
import {
	animate,
	state,
	style,
	transition,
	trigger,
}                                                   from '@angular/animations';
import { TranslateService }                         from '@ngx-translate/core';
import { first }                                    from 'rxjs/operators';
import { ILocaleMember }                            from '@modules/server.common/interfaces/ILocale';
import Order                                        from '@modules/server.common/entities/Order';
import Warehouse                                    from '@modules/server.common/entities/Warehouse';
import { ProductLocalesService }                    from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseOrdersRouter }                    from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseRouter }                          from '@modules/client.common.angular2/routers/warehouse-router.service';
import { CarrierRouter }                            from '@modules/client.common.angular2/routers/carrier-router.service';
import { MessagePopUpComponent }                    from 'app/shared/message-pop-up/message-pop-up.component';
import { CarrierLocationComponent }                 from '../location/carrier-location.component';

@Component({
	           selector:    'order',
	           animations:  [
		           trigger('show', [
			           state('shown', style({ opacity: 1 })),
			           state('hidden', style({ opacity: 0 })),
			           transition('shown <=> hidden', animate('.2s')),
		           ]),
	           ],
	           styleUrls:   ['./order.component.scss'],
	           templateUrl: './order.component.html',
           })
export class OrderComponent implements OnInit
{
	@Input()
	public order: Order;
	
	public title: string;
	public price: number;
	public description: string;
	public img: string;
	public products;
	public orderStatusText: string;
	public orderNumber: number;
	public orderCurrency: string;
	public orderNotes: string;
	public orderType: number;
	public createdAt: Date;
	public createdAtConverted: string;
	public warehouse: Warehouse;
	public totalPrice;
	public carrier;
	public _isButtonDisabled: boolean = true;
	
	public PREFIX_ORDER_STATUS: string = 'ORDER_CARRIER_STATUS.';
	public orderStatusTextTranslates: string;
	
	public cancelPopUpButton: string = 'CANCEL';
	public confirmPopUpButton: string = 'OK';
	public commonPopUpText: string = 'CANCEL_ORDER';
	public modalTitleText: string = 'CONFIRMATION';
	
	constructor(
			@Inject(DOCUMENT)
			public document: Document,
			public router: Router,
			private warehouseOrdersRouter: WarehouseOrdersRouter,
			private readonly warehouseRouter: WarehouseRouter,
			private readonly carrierRouter: CarrierRouter,
			private readonly _productLocalesService: ProductLocalesService,
			private translateService: TranslateService,
			private dialog: MatDialog,
			private readonly ngZone: NgZone
	)
	{}
	
	public ngOnInit()
	{
		this.warehouseRouter
		    .get(this.order.warehouseId, false)
		    .pipe(first())
		    .subscribe((store) =>
		               {
			               this.ngZone.run(() =>
			                               {
				                               this.warehouse = store;
				
				                               this.orderCancelationCheck(
						                               this.warehouse.orderCancelation,
						                               this.order
				                               );
			                               });
		               });
		
		if(this.order.carrierId)
		{
			this.carrierRouter
			    .get(this.order.carrierId)
			    .pipe(first())
			    .subscribe((carrier) =>
			               {
				               this.carrier = carrier;
			               });
		}
		this.loadData();
	}
	
	public openDialog(): void
	{
		//duble ckeck orderCancelation
		if(this._isButtonDisabled)
		{
			throw new Error('You can not Cancle this Order!!! ');
		}
		//---
		const dialogRef = this.dialog.open(MessagePopUpComponent, {
			width: '560px',
			data:  {
				modalTitle:    this.modalTitleText,
				cancelButton:  this.cancelPopUpButton,
				confirmButton: this.confirmPopUpButton,
				commonText:    this.commonPopUpText,
			},
		});
		
		dialogRef.afterClosed().subscribe((result) =>
		                                  {
			                                  if(result)
			                                  {
				                                  return this.warehouseOrdersRouter
				                                             .cancel(this.order._id.toString())
				                                             .then();
			                                  }
		                                  });
	}
	
	public openMap(): void
	{
		this.dialog.open(CarrierLocationComponent, {
			width:      '560px',
			panelClass: 'app-dialog-container',
			data:       {
				carrier:   this.carrier,
				merchant:  this.warehouse,
				userOrder: this.order.customer,
			},
		});
	}
	
	public getTranslate(key: string): string
	{
		let translationResult = '';
		
		this.translateService.get(key).subscribe((res) =>
		                                         {
			                                         translationResult = res;
		                                         });
		
		return translationResult;
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	protected orderCancelationCheck(storeCancelation, order)
	{
		if(!storeCancelation || !storeCancelation.enabled)
		{
			this._isButtonDisabled = false;
			return;
		}
		if(
				storeCancelation.onState >
				order.warehouseStatus + order.carrierStatus
		)
		{
			this._isButtonDisabled = false;
			return;
		}
	}
	
	private loadData()
	{
		this.price = 0;
		if(this.order.products.length)
		{
			this.title = this.localeTranslate(
					this.order.products[0].product.title
			);
			this.price = this.order.totalPrice;
			this.description = this.localeTranslate(
					this.order.products[0].product.description
			);
			this.img = this.localeTranslate(
					this.order.products[0].product.images
			);
			this.products = this.order.products;
		}
		this.orderStatusText = this.order.warehouseStatusText;
		this.orderStatusTextTranslates =
				this.PREFIX_ORDER_STATUS + this.orderStatusText;
		this.orderNumber = this.order.orderNumber;
		this.orderType = this.order.orderType;
		this.createdAt = this.order.createdAt;
	}
}
