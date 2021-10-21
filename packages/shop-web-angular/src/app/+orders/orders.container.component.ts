import { Component, NgZone }    from '@angular/core';
import { CustomerOrdersRouter } from '@modules/client.common.angular2/routers/customer-orders-router.service';
import Order                    from '@modules/server.common/entities/Order';
import { StorageService }       from 'app/services/storage';

@Component({
	           selector: 'orders-container',
	           template: `
		                     <orders *ngIf="orders" [orders]="orders"></orders>
		                     <div
				                     *ngIf="!orders.length"
				                     style="text-align:center; font-size:28px;margin:20px 0"
		                     >
			                     {{ 'ORDER_VIEW.NO_ORDERS' | translate }}  ...
		                     </div>
	                     `,
           })
export class OrdersContainerComponent
{
	public orders: Order[] = [];
	
	constructor(
			private readonly userOrdersRouter: CustomerOrdersRouter,
			private readonly ngZone: NgZone,
			private readonly storage: StorageService
	)
	{
		const userId = storage.userId;
		
		this.userOrdersRouter
		    .get(userId)
		    .subscribe((res: Order[]) =>
		               {
			               this.ngZone
			                   .run(() =>
			                        {
				                        this.orders = res.filter((r: Order) => !r.isCancelled);
			                        });
		               });
	}
}
