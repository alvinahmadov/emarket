import { Component, Input } from '@angular/core';
import CommonUtils          from '@modules/server.common/utilities/common';

@Component({
	           selector: 'order-title',
	           styleUrls: ['./order-title.scss'],
	           templateUrl: 'order-title.html',
           })
export class OrderTitleComponent
{
	@Input()
	public order;
	
	get orderName()
	{
		return CommonUtils.getIdFromTheDate(this.order);
	}
	
	get userFullName()
	{
		const fullName = `${this.order.user.firstName || ''} ${
				this.order.user.lastName || ''
		}`;
		return fullName.trim();
	}
	
	constructor() {}
}
