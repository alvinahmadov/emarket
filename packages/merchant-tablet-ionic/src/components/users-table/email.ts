import { Component, OnInit }      from '@angular/core';
import { ViewCell }               from 'ng2-smart-table';
import { ModalController }        from '@ionic/angular';
import Customer                   from '@modules/server.common/entities/Customer';
import { CustomerEmailPopupPage } from 'pages/+customers/customer-email-popup/customer-email-popup';

@Component({
	           template: `
		                     <div class="text-center">
			                     <ion-icon
					                     *ngIf="customer.email"
					                     name="mail"
					                     class="mail-icon icon icon-md ion-md-mail"
					                     (click)="presentCustomerEmailPopup(customer)"
			                     >
			                     </ion-icon>
		                     </div>
	                     `,
           })
export class EmailComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public customer: Customer;
	
	constructor(public modalCtrl: ModalController) {}
	
	public ngOnInit(): void
	{
		this.customer = this.rowData.customer;
	}
	
	public async presentCustomerEmailPopup(customer: Customer)
	{
		const modal = await this.modalCtrl
		                        .create({
			                                component:      CustomerEmailPopupPage,
			                                componentProps: { customer },
			                                cssClass:       'customer-email',
		                                });
		await modal.present();
	}
}
