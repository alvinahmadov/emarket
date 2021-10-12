import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import Order                 from '@modules/server.common/entities/Order';

@Component({
	           template: `
		                     <div class="space">
			                     {{ 'CUSTOMERS_VIEW.ORDERS_POP_UP.COMPLETED' | translate }}
			                     {{ order.isCompleted ? ' ✔' : ' ✘' }}
		                     </div>
		                     <div class="space">
			                     {{ 'CUSTOMERS_VIEW.ORDERS_POP_UP.PAID' | translate }}
			                     {{ order.isPaid ? ' ✔' : ' ✘' }}
		                     </div>
	                     `,
           })
export class StatusComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public order: Order;
	
	public ngOnInit(): void
	{
		this.order = this.rowData.order;
	}
}
