import { Component, Input } from '@angular/core';
import CustomerOrder        from '@modules/server.common/entities/CustomerOrder';

@Component({
	           selector:    'customer-info',
	           styleUrls:   ['./customer-info.scss'],
	           templateUrl: './customer-info.html',
           })
export class CustomerInfoComponent
{
	@Input()
	public customer: CustomerOrder;
	
	constructor() {}
}
