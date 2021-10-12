import { Component, OnInit, Input } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import { CallNumber }               from '@ionic-native/call-number/ngx';
import Customer                     from '@modules/server.common/entities/Customer';
import { Storage }                  from '../../services/storage.service';

@Component({
	           selector: 'user-phone',
	           template: `
		                     <ion-icon
				                     *ngIf="customer.phone"
				                     name="call"
				                     class="call-icon icon icon-md ion-md-call"
				                     (click)="attemptCall(customer.phone)"
				                     [ngClass]="canCall ? 'can-call' : 'can-not-call'"
		                     >
		                     </ion-icon>
		
		                     <span>{{ customer.phone || '' }}</span>
	                     `,
           })
export class UserPhoneComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	
	@Input()
	public customer: Customer;
	
	constructor(private store: Storage, public callNumber: CallNumber) {}
	
	public ngOnInit(): void
	{
		if(this.rowData)
		{
			this.customer = this.rowData.customer;
		}
	}
	
	public get canCall(): boolean
	{
		if(this.store.platform)
		{
			return (
					this.store.platform.toLocaleLowerCase() === 'android' ||
					this.store.platform.toLocaleLowerCase() === 'ios'
			);
		}
		return false;
	}
	
	public attemptCall(phone: string)
	{
		if(this.canCall)
		{
			this.callNumber
			    .callNumber(phone, true)
			    .then((res) => console.warn('Called number!', res))
			    .catch((err) => console.log('Error calling number!', err));
		}
	}
}
