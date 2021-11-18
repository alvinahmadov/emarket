import {
	Component,
	Inject,
	OnInit
}                                        from '@angular/core';
import { DOCUMENT }                      from '@angular/common';
import { ILocaleMember }                 from '@modules/server.common/interfaces/ILocale';
import Order                             from '@modules/server.common/entities/Order';
import OrderProduct                      from '@modules/server.common/entities/OrderProduct';
import { OrderRouter }                   from '@modules/client.common.angular2/routers/order-router.service';
import { ProductLocalesService }         from '@modules/client.common.angular2/locale/product-locales.service';
import { StorageService }                from 'app/services/storage';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import _                                 from "lodash";
import Currency                          from '@modules/server.common/entities/Currency';

type TOrderData = {
	order: Order;
	title: string;
	price: number;
	totalPrice: number;
	currency: Currency;
	description: string;
}

@Component({
	           selector:    'ea-payment-dialog',
	           templateUrl: './payment-dialog.component.html',
	           styleUrls:   ['./payment-dialog.component.scss']
           })
export class PaymentDialogComponent implements OnInit
{
	public order: Order;
	public title: string;
	public description: string;
	public currency: Currency;
	public totalPrice: number;
	public price: number;
	
	constructor(
			public dialogRef: MatDialogRef<PaymentDialogComponent>,
			@Inject(MAT_DIALOG_DATA)
			public data: TOrderData,
			@Inject(DOCUMENT)
			private readonly documentRef: Document,
			private readonly orderRouter: OrderRouter,
			private readonly _productLocalesService: ProductLocalesService,
			public readonly storage: StorageService
	)
	{}
	
	public ngOnInit(): void
	{
		this.order = this.data.order;
		this.title = this.data.title;
		this.description = this.data.description;
		this.currency = this.data.currency;
		this.price = this.order.products[0].price ?? 0;
		this.totalPrice = this.order.totalPrice ?? _.sum(
				_.map(
						this.order.products,
						(product: OrderProduct) => product.count * product.price
				)
		);
	}
	
	public get paymentId(): string
	{
		return this.order.customer.stripeCustomerId;
	}
	
	public get orderCurrencyAmount(): PaymentCurrencyAmount
	{
		return {
			currency: this.currency.code,
			value:    this.order.totalPrice.toString()
		}
	}
	
	public get totalsOrdersSum(): PaymentItem
	{
		return {
			amount:  {
				currency: this.currency.code,
				value:    this.totalPrice.toString()
			},
			label:   this.description,
			pending: true
		}
	}
	
	public pay(
			methodData: PaymentMethodData[],
			details: PaymentDetailsInit,
			options: PaymentOptions = {},
	): Promise<PaymentResponse>
	{
		if(
				this.documentRef.defaultView === null ||
				!('PaymentRequest' in this.documentRef.defaultView)
		)
		{
			return Promise.reject(new Error('PaymentRequest is not supported'));
		}
		
		const gateway = new PaymentRequest(methodData, details, options);
		
		return gateway
				.canMakePayment()
				.then(canPay =>
						      canPay
						      ? gateway.show()
						      : Promise.reject(
								      new Error('Payment Request cannot make the payment'),
						      ),
				);
	}
	
	public getPaymentTitle(orderProduct: OrderProduct): string
	{
		return this.localeTranslate(orderProduct.product.title);
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	public getOrderCurrencyAmount(orderProduct: OrderProduct): PaymentCurrencyAmount
	{
		return {
			currency: this.currency.code,
			value:    orderProduct.price.toString()
		}
	}
	
	public onPayment(paymentResponse: PaymentResponse)
	{
		console.debug(paymentResponse.toJSON())
		// this.orderRouter.complete(this.order.id);
	}
	
	public onPaymentError(ev: any)
	{
		console.error(ev)
	}
	
}
