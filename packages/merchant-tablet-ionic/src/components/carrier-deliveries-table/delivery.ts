import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import Order                 from '@modules/server.common/entities/Order';
import CommonUtils           from "@ever-platform/common/build/utilities/common";

@Component({
	           template: `
		<span>
			<div>{{ order._createdAt | date: 'short' }}</div>
			<div>{{ getTotalDeliveryTime(order) }}</div>
		</span>
	`,
           })
export class DeliveryComponent implements ViewCell, OnInit
{
	value: string | number;
	rowData: any;
	order: Order;
	
	constructor() {}
	
	ngOnInit(): void
	{
		this.order = this.rowData.order;
	}
	
	getTotalDeliveryTime(order: Order)
	{
		return CommonUtils.getTotalDeliveryTime(order);
	}
}
