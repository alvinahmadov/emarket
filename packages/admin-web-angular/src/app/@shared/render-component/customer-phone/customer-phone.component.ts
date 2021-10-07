import { Component, Input } from '@angular/core';

@Component({
	           styleUrls:   ['./customer-phone.component.scss'],
	           templateUrl: './customer-phone.component.html',
           })
export class CustomerPhoneComponent
{
	@Input()
	public rowData: any;
	
	constructor() {}
	
	public get phone(): string
	{
		return this.rowData['phone'];
	}
	
	public get hasPhone(): boolean
	{
		return this.rowData['phone'].length > 0;
	}
}
