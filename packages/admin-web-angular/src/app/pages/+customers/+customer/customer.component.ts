import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router }       from '@angular/router';
import { Observable, Subject }          from 'rxjs';
import { first, takeUntil, switchMap }  from 'rxjs/operators';
import Customer                         from '@modules/server.common/entities/Customer';
import { CustomersService }             from '@app/@core/data/customers.service';

@Component({
	           selector:    'ea-customer',
	           styleUrls:   ['./customer.component.scss'],
	           templateUrl: './customer.component.html',
           })
export class CustomerComponent implements OnInit, OnDestroy
{
	customer$: Observable<Customer>;
	customers: Customer[] = [];
	selectedCustomer: Customer;
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _customersService: CustomersService,
			private readonly _router: ActivatedRoute,
			private readonly _route: Router
	)
	{}
	
	ngOnInit()
	{
		this.customer$ = this._router.params.pipe(
				switchMap((p) =>
				          {
					          return this._customersService.getCustomerById(p.id);
				          })
		);
		
		(async() =>
		{
			return this.loadUsers();
		})();
	}
	
	ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	async loadUsers()
	{
		this._customersService
		    .getCustomers()
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe((customers) =>
		               {
			               this.customers = customers;
			               this._selectCurrentUser();
		               });
	}
	
	async customerSelect(e)
	{
		this._route.navigate([`/customers/list/${e.id}`]);
		await this.loadUsers();
	}
	
	private async _selectCurrentUser()
	{
		const routeParams = await this._router.params.pipe(first()).toPromise();
		this.selectedCustomer = this.customers.filter(
				(u) => u.id === routeParams.id
		)[0];
	}
}
