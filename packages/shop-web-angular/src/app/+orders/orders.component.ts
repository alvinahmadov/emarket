import { Component, Input, OnInit } from '@angular/core';
import Order                        from '@modules/server.common/entities/Order';

@Component({
	           selector:    'orders',
	           styleUrls:   ['./orders.component.scss'],
	           template: `
		                     <div *ngFor="let order of orders" class="orders">
			                     <order [order]="order"></order>
		                     </div>
	                     `,
           })
export class OrdersComponent implements OnInit
{
	@Input()
	public orders: Order[];
	
	public ordersSum: number;
	
	constructor() {}
	
	public ngOnInit()
	{
		this.getTotalOrdersSum();
	}
	
	public getTotalOrdersSum()
	{
		this.ordersSum = this.orders
		                     .map((order) => order.totalPrice)
		                     .reduce((prevPrice, nextPrice) => prevPrice + nextPrice, 0);
	}
}
