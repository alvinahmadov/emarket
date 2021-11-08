import { Component, Input } from '@angular/core';
import CustomerOrder        from '@modules/server.common/entities/CustomerOrder';
import Customer             from '@modules/server.common/entities/Customer';

@Component({
	           selector:    'customer-info',
	           styleUrls:   ['./customer-info.scss'],
	           templateUrl: './customer-info.html',
           })
export class CustomerInfoComponent
{
	@Input()
	public customer: CustomerOrder;
	
	public get fullName(): string
	{
		return this.customer ? this.customer.fullName : "No customer name";
	}
	
	public get fullAddress(): string
	{
		return this.customer ? this.customer.fullAddress : "No address";
	}
	
	public get asCustomer(): Customer
	{
		return <Customer> this.customer;
	}
}
