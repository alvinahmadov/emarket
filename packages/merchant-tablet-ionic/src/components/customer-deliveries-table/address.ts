import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import Customer              from '@modules/server.common/entities/Customer';
import Order                 from '@modules/server.common/entities/Order';

@Component({
	           template: `
		                     <span class="nameAddress">
			                     <span *ngIf="order.isCompleted" class="address">
				                     {{ getCustomerFullAddress(order) }}
			                     </span>
		                     </span>
	                     `,
           })
export class AddressComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public order: Order;
	
	public ngOnInit(): void
	{
		this.order = this.rowData.order;
	}
	
	public getCustomerFullAddress(order: Order): string
	{
		const addressUser: Customer = order.customer as Customer;
		const geoLocation = addressUser.geoLocation;
		return `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
	}
}
