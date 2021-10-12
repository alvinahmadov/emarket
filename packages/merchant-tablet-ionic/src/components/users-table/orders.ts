import { Component, OnInit }           from '@angular/core';
import { ModalController }             from '@ionic/angular';
import { ViewCell }                    from 'ng2-smart-table';
import Customer                        from '@modules/server.common/entities/Customer';
import Order                           from '@modules/server.common/entities/Order';
import { CustomerDeliveriesPopupPage } from 'pages/+customers/customer-deliveries-popup/customer-deliveries-popup';

@Component({
	           template: `
		                     <div class="text-center">
			                     <span class="ordersCount"
			                           (click)="showDeliveriesInfo(customer)">
				                     {{ rowData?.orders }}
			                     </span>
			                     <div></div>
		                     </div>
	                     `,
           })
export class OrdersComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public customer: Customer;
	public orders: Order[];
	
	constructor(public modalCtrl: ModalController) {}
	
	ngOnInit(): void
	{
		this.customer = this.rowData.customer;
		this.orders = this.rowData.allOrders;
	}
	
	public getOrdersCount(customerId: string)
	{
		return this.orders
		           .filter((o: Order) => o.customer.id === customerId).length;
	}
	
	public async showDeliveriesInfo(customer: Customer)
	{
		const modal = await this.modalCtrl
		                        .create({
			                                component:      CustomerDeliveriesPopupPage,
			                                componentProps: { customer },
			                                cssClass:       'customer-deliveries',
		                                });
		await modal.present();
	}
}
