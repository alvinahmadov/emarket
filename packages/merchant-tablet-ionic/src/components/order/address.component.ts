import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import Customer              from '@modules/server.common/entities/Customer';

@Component({
	           styles:   [
		           `
                       h1 {
                           font-weight: normal !important;
                       }

                       .address {
                           font-style: italic !important;
                           text-decoration: underline;
                           display: block !important;
                       }
		           `,
	           ],
	           template: `
		                     <strong>
			                     {{ customer?.geoLocation.city }}
			                     <span *ngIf="customer?.geoLocation.postcode">
				           ({{ customer?.geoLocation.postcode }})
			           </span>
		                     </strong>
		                     <span *ngIf="customer" class="address">
			           {{ getStoreFullAddress(customer) }}
		           </span>
	                     `,
           })
export class AddressComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public customer: Customer;
	
	public ngOnInit(): void
	{
		this.customer = this.rowData.customer;
	}
	
	public getStoreFullAddress(customer: Customer): string
	{
		const geoLocation = customer.geoLocation;
		return `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
	}
}
