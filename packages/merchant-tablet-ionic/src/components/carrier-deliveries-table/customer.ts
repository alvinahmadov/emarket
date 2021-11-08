import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import Order                 from '@modules/server.common/entities/Order';

@Component({
	           template: `
		                     <span class="nameAddress">
			                     <strong *ngIf="getFullName(order)">
				                     {{ getFullName(order) }}
			                     </strong>
			                     <div class="address">
				           {{ order.customer.fullAddress }}
			           </div>
		                     </span>
	                     `,
           })
export class CustomerComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public order: Order;
	
	constructor() {}
	
	public ngOnInit(): void
	{
		this.order = this.rowData.order;
	}
	
	public getFullName(order: Order)
	{
		return order.customer.fullName
	}
}
