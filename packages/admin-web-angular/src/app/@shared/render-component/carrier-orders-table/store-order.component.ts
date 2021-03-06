import { Component, Input, OnInit } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import { Router }                   from '@angular/router';

@Component({
	           templateUrl: './store-order.component.html',
	           styles: [
		           `
			.warehouse-image {
				width: 30px;
				height: 30px;
				margin-right: 5px !important;
				margin-bottom: 3px !important;
			}
		`,
	           ],
           })
export class StoreOrderComponent implements ViewCell, OnInit
{
	value: string | number;
	
	@Input()
	rowData: any;
	
	constructor(private readonly router: Router) {}
	
	ngOnInit() {}
	
	redirect()
	{
		if(this.rowData.warehouse.id)
		{
			this.router.navigate([`stores/${this.rowData.warehouse.id}`]);
		}
	}
}
