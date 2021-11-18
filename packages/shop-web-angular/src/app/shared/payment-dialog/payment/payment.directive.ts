import {
	ContentChildren,
	Directive,
	Input,
	QueryList
}                               from '@angular/core';
import { PaymentItemDirective } from './payment-item.directive';

@Directive({
	           selector: '[waPayment][paymentTotal]',
           })
export class PaymentDirective implements PaymentDetailsInit
{
	@Input('paymentTotal')
	public total!: PaymentItem;
	
	@Input('paymentId')
	public id?: string;
	
	@Input('paymentModifiers')
	public modifiers?: PaymentDetailsModifier[];
	
	@Input('paymentShippingOptions')
	public shippingOptions?: PaymentShippingOption[];
	
	@ContentChildren(PaymentItemDirective)
	public set paymentItems(items: QueryList<PaymentItem>)
	{
		this.displayItems = items.toArray();
	}
	
	public displayItems?: PaymentItem[];
}
