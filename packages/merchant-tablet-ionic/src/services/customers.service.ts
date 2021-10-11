import { Injectable }                    from '@angular/core';
import { Apollo }                        from 'apollo-angular';
import { map, share }                    from 'rxjs/operators';
import { Observable }                    from 'rxjs';
import ICustomer, { ICustomerFindInput } from '@modules/server.common/interfaces/ICustomer';
import Customer                          from '@modules/server.common/entities/Customer';
import { GQLQueries }                    from '@modules/server.common/utilities/graphql';

@Injectable()
export class CustomersService
{
	constructor(private readonly _apollo: Apollo) {}
	
	public getCustomer(id: string): Observable<Customer>
	{
		return this._apollo
		           .query<{
			           customer: ICustomer
		           }>({
			              query:     GQLQueries.CustomerById,
			              variables: { id }
		              })
		           .pipe(
				           map((res) => this._customerFactory(res.data.customer))
		           );
	}
	
	public getCustomers(): Observable<Customer[]>
	{
		return this._apollo
		           .watchQuery<{
			           customers: ICustomer[]
		           }>({
			              query:        GQLQueries.UserAll,
			              pollInterval: 5000,
		              })
		           .valueChanges
		           .pipe(
				           map((res) => res.data.customers),
				           map((customers) => customers.map(
						           (customer) => this._customerFactory(customer))
				           ),
				           share()
		           );
	}
	
	public findCustomer(findInput: ICustomerFindInput): Observable<Customer>
	{
		return this._apollo
		           .query<{
			           customer: ICustomer
		           }>({
			              query:     GQLQueries.CustomerFindByInput,
			              variables: { findInput }
		              })
		           .pipe(
				           map((res) => this._customerFactory(res.data.customer))
		           );
	}
	
	protected _customerFactory(customer: ICustomer)
	{
		return customer != null
		       ? new Customer(customer)
		       : null;
	}
}
