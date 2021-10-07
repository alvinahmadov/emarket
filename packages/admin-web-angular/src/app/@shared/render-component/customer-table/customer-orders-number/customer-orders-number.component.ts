import { OnInit, Component } from '@angular/core';
import { Router }            from '@angular/router';
import { ViewCell }          from 'ng2-smart-table';

@Component({
	           styleUrls:   ['customer-orders-number.component.scss'],
	           templateUrl: 'customer-orders-number.component.html',
           })
export class CustomerOrdersNumberComponent implements ViewCell, OnInit
{
	public value: any;
	public rowData: any;
	public quantity: number;
	
	constructor(private readonly _router: Router) {}
	
	public ngOnInit()
	{
		this.quantity = this.rowData['ordersQty'];
	}
}
