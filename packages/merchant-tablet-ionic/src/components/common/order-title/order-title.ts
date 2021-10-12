import { Component, Input } from '@angular/core';
import Customer             from '@modules/server.common/entities/Customer';
import CommonUtils          from '@modules/server.common/utilities/common';

@Component({
	           selector:    'order-title',
	           styleUrls:   ['./order-title.scss'],
	           templateUrl: './order-title.html',
           })
export class OrderTitleComponent
{
	@Input()
	public order;
	
	public get orderName()
	{
		return CommonUtils.getIdFromTheDate(this.order);
	}
	
	public get userFullName()
	{
		const customer = this.order.customer as Customer;
		return customer.fullName;
	}
}
