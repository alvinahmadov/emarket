import { Injectable }                    from '@angular/core';
import { Apollo }                        from 'apollo-angular';
import { map, share }                    from 'rxjs/operators';
import { Observable }                    from 'rxjs';
import ICustomer, { ICustomerFindInput } from '@modules/server.common/interfaces/ICustomer';
import Customer                          from '@modules/server.common/entities/Customer';
import ApolloService                     from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }                      from '../graphql/definitions';

@Injectable()
export class CustomersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName: "Merchant::CustomersService"
		      });
	}
	
	public getCustomer(id: string): Observable<Customer>
	{
		return this.apollo
		           .query<{
			           customer: ICustomer
		           }>({
			              query:     GQLQuery.Customer.GetById,
			              variables: { id }
		              })
		           .pipe(map((result) => <Customer>
				           this.factory(result, Customer)));
	}
	
	public getCustomers(): Observable<Customer[]>
	{
		return this.apollo
		           .watchQuery<{
			           customers: ICustomer[]
		           }>({
			              query:        GQLQuery.Customer.GetAll,
			              pollInterval: this.pollInterval,
		              }).valueChanges
		           .pipe(
				           map((result) => <Customer[]>
						           this.factory(result, Customer)),
				           share()
		           );
	}
	
	public findCustomer(findInput: ICustomerFindInput): Observable<Customer>
	{
		return this.apollo
		           .query<{
			           customer: ICustomer
		           }>({
			              query:     GQLQuery.Customer.Find,
			              variables: { findInput }
		              })
		           .pipe(map((result) => <Customer>
				           this.factory(result, Customer)));
	}
}
