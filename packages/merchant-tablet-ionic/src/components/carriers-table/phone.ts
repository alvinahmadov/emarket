import { Component, OnInit, Input } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import Carrier                      from '@modules/server.common/entities/Carrier';
import { StorageService }           from 'services/storage.service';
import { CallNumber }               from '@ionic-native/call-number/ngx';

@Component({
	           selector: 'carrier-phone',
	           template: `
		                     <ion-icon
				                     *ngIf="carrier?.phone"
				                     name="call"
				                     class="call-icon icon icon-md ion-md-call"
				                     (click)="attemptCall(carrier?.phone)"
				                     [ngClass]="canCall ? 'can-call' : 'can-not-call'"
		                     >
		                     </ion-icon>
		                     <span>{{ carrier?.phone || '' }}</span>
	                     `,
           })
export class PhoneComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	
	@Input()
	public carrier: Carrier;
	
	constructor(private storageService: StorageService, public callNumber: CallNumber) {}
	
	public ngOnInit(): void
	{
		if(this.rowData)
		{
			this.carrier = this.rowData.carrier;
		}
	}
	
	public get canCall()
	{
		if(this.storageService.platform)
		{
			return (
					this.storageService.platform.toLocaleLowerCase() === 'android' ||
					this.storageService.platform.toLocaleLowerCase() === 'ios'
			);
		}
		return false;
	}
	
	public attemptCall(phone)
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
