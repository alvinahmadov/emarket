import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import { environment }       from '@modules/client.common.angular2/environments/environment';
import Customer              from '@modules/server.common/entities/Customer';
import Order                 from '@modules/server.common/entities/Order';

@Component({
	           template: `
		                     <div class="text-center"
		                          *ngIf="rowData?.total !== 0"
		                     >
			                     <span>{{ rowData.total }} {{ currencySymbol }}</span>
			                     <div></div>
		                     </div>
	                     `,
           })
export class TotalComponent implements ViewCell, OnInit
{
	readonly currencySymbol: string = environment.CURRENCY_SYMBOL;
	public value: string | number;
	public rowData: any;
	public customer: Customer;
	public orders: Order[];
	
	constructor() {}
	
	public ngOnInit(): void
	{
		this.customer = this.rowData.customer;
		this.orders = this.rowData.allOrders;
	}
	
	public getTotalPrice(customerId: string): number
	{
		const orders = this.orders
		                   .filter((o: Order) => o.isPaid)
		                   .filter((o: Order) => o.customer.id === customerId);
		let totalPrice = 0;
		if(orders.length > 0)
		{
			totalPrice = orders
					.map((o: Order) => o.totalPrice)
					.reduce((a, b) => a + b);
		}
		return totalPrice;
	}
}
