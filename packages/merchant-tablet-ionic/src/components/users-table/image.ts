import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import Customer              from '@modules/server.common/entities/Customer';

@Component({
	           selector:  'customer-image-view',
	           styleUrls: ['./image.scss'],
	           template:  `
		                      <span class="image-component">
			                      <img *ngIf="customer?.avatar"
			                           alt="{{ customer.username }}"
			                           src="{{ customer.avatar }}"/>
		                      </span>
	                      `,
           })
export class ImageUserComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public customer: Customer;
	
	constructor() {}
	
	public ngOnInit(): void
	{
		this.customer = this.rowData.customer;
	}
}
