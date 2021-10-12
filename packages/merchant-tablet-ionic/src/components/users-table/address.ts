import { Component, OnInit }     from '@angular/core';
import { ModalController }       from '@ionic/angular';
import { ViewCell }              from 'ng2-smart-table';
import Customer                  from '@modules/server.common/entities/Customer';
import { CustomerAddrPopupPage } from 'pages/+customers/customer-addr-popup/customer-addr-popup';

@Component({
	           template: `
		                     <span class="underlined"
		                           (click)="showAddress(customer)">
			           {{ customer.geoLocation.city }}
			                     <span *ngIf="customer.geoLocation.postcode">{{
				                     '(' + customer.geoLocation.postcode + ')'
				                     }}
			           </span>
		           </span>
	                     `,
           })
export class AddressComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public customer: Customer;
	
	constructor(public modalCtrl: ModalController) {}
	
	public ngOnInit(): void
	{
		this.customer = this.rowData.customer;
	}
	
	public async showAddress(customer: Customer)
	{
		const modal = await this.modalCtrl.create({
			                                          component:      CustomerAddrPopupPage,
			                                          componentProps: { customer },
			                                          cssClass:       'customer-address-popup',
		                                          });
		await modal.present();
	}
}
