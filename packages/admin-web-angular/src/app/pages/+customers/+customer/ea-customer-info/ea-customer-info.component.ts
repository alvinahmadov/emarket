import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute }       from '@angular/router';
import { first }                from 'rxjs/operators';
import Customer                 from '@modules/server.common/entities/Customer';
import { CustomersService }     from '@app/@core/data/customers.service';

@Component({
	           selector:    'ea-customer-info',
	           styleUrls:   ['ea-customer-info.component.scss'],
	           templateUrl: './ea-customer-info.component.html',
           })
export class CustomerInfoComponent implements OnDestroy
{
	showCode: boolean = false;
	params$: any;
	customer: Customer;
	
	constructor(
			private readonly _customerService: CustomersService,
			private readonly _router: ActivatedRoute
	)
	{
		this.params$ = this._router.params.subscribe(async(r) =>
		                                             {
			                                             this.customer = await this._customerService
			                                                                       .getCustomerById(r.id)
			                                                                       .pipe(first())
			                                                                       .toPromise();
		                                             });
	}
	
	ngOnDestroy(): void
	{
		if(this.params$)
		{
			this.params$.unsubscribe();
		}
	}
}
