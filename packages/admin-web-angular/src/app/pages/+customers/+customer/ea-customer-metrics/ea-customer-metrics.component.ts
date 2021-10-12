import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute }       from '@angular/router';
import { Subscription }         from 'apollo-client/util/Observable';
import Customer                 from '@modules/server.common/entities/Customer';
import { CustomersService }     from '@app/@core/data/customers.service';

type UserMetrics = {
	totalOrders: number;
	canceledOrders: number;
	completedOrdersTotalSum: number;
}

@Component({
	           selector:    'ea-customer-metrics',
	           templateUrl: './ea-customer-metrics.component.html',
           })
export class CustomerMetricsComponent implements OnDestroy
{
	public showCode: boolean = false;
	public params$: Subscription;
	public customer: Customer;
	public userMetrics: UserMetrics;
	
	constructor(
			private readonly _router: ActivatedRoute,
			private userService: CustomersService
	)
	{
		this.params$ = this._router
		                   .params
		                   .subscribe(async(r) =>
		                              {
			                              this.userMetrics = await this.userService.getCustomerMetrics(r.id);
		                              });
	}
	
	public ngOnDestroy(): void
	{
		if(this.params$)
		{
			this.params$.unsubscribe();
		}
	}
}
