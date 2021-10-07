import { Component, Input } from '@angular/core';

@Component({
	           styleUrls:   ['./customer-email.component.scss'],
	           templateUrl: './customer-email.component.html',
           })
export class CustomerEmailComponent
{
	@Input()
	rowData: any;
	
	constructor() {}
	
	public get hasEmail(): boolean
	{
		return this.rowData['email'].length > 0;
	}
	
	public get email(): string
	{
		return this.rowData['email'];
	}
}
