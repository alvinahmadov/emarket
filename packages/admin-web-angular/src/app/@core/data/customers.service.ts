import { Injectable }                             from '@angular/core';
import { Apollo }                                 from 'apollo-angular';
import { Observable }                             from 'rxjs';
import { map, share }                             from 'rxjs/operators';
import ICustomer, { IResponseGenerateCustomers, } from '@modules/server.common/interfaces/ICustomer';
import IPagingOptions                             from '@modules/server.common/interfaces/IPagingOptions';
import Customer                                   from '@modules/server.common/entities/Customer';
import { ICustomerRegistrationInput }             from '@modules/server.common/routers/ICustomerAuthRouter';
import { GQLMutations, GQLQueries }               from '@modules/server.common/utilities';

@Injectable()
export class CustomersService
{
	constructor(private readonly _apollo: Apollo) {}
	
	isCustomerEmailExists(email: string): Promise<boolean>
	{
		return this._apollo
		           .query<{
			           isUserEmailExists: boolean
		           }>({
			              query:     GQLQueries.CustomerEmailExists,
			              variables: { email },
		              })
		           .pipe(map((res) => res.data.isUserEmailExists))
		           .toPromise();
	}
	
	isCustomerExists(conditions: {
		exceptCustomerId: string;
		memberKey: string;
		memberValue: string;
	}): Observable<boolean>
	{
		return this._apollo
		           .query({
			                  query:     GQLQueries.CustomerExists,
			                  variables: { conditions },
		                  })
		           .pipe(map((res) => res.data['isUserExists']));
	}
	
	getCustomers(pagingOptions?: IPagingOptions): Observable<Customer[]>
	{
		return this._apollo
		           .watchQuery<{
			           customers: ICustomer[]
		           }>(
				           {
					           query:        GQLQueries.CustomerAllPaging,
					           variables:    { pagingOptions },
					           pollInterval: 5000,
				           }
		           )
		           .valueChanges
		           .pipe(
				           map((res) => res.data.customers),
				           map((customers) => customers.map((customer) => this._customerFactory(customer))),
				           share()
		           );
	}
	
	getCustomerById(id: string)
	{
		return this._apollo
		           .query({
			                  query:     GQLQueries.CustomerById,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['customer']),
				           map((user) => this._customerFactory(user)),
				           share()
		           );
	}
	
	removeByIds(ids: string[])
	{
		return this._apollo
		           .mutate({
			                   mutation:  GQLMutations.CustomerRemoveByIds,
			                   variables: { ids },
		                   });
	}
	
	async registerCustomer(registerInput: ICustomerRegistrationInput)
	{
		const res = await this._apollo
		                      .mutate({
			                              mutation:  GQLMutations.CustomerRegister,
			                              variables: { registerInput },
		                              })
		                      .toPromise();
		
		return res.data['registerCustomer'];
	}
	
	async banCustomer(id: string)
	{
		return this._apollo
		           .mutate({
			                   mutation:  GQLMutations.CustomerBan,
			                   variables: { id },
		                   })
		           .toPromise();
	}
	
	async unbanCustomer(id: string)
	{
		return this._apollo
		           .mutate({
			                   mutation:  GQLMutations.CustomerUnban,
			                   variables: { id },
		                   })
		           .toPromise();
	}
	
	async getCountOfCustomers()
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.CustomersCount,
		                             })
		                      .toPromise();
		
		return res.data['getCountOfCustomers'];
	}
	
	async getCustomerMetrics(
			id: string
	): Promise<{
		totalOrders: number;
		canceledOrders: number;
		completedOrdersTotalSum: number;
	}>
	{
		const res = await this._apollo
		                      .query({
			                             query:     GQLQueries.UserMetrics,
			                             variables: { id },
		                             })
		                      .toPromise();
		
		return res.data['getCustomerMetrics'];
	}
	
	generateCustomCustomers(
			qty: number = 1000,
			defaultLng: number,
			defaultLat: number
	): Observable<IResponseGenerateCustomers>
	{
		return this._apollo
		           .query<{
			           generateCustomers: IResponseGenerateCustomers
		           }>({
			              query:     GQLQueries.UserGenerateCustom,
			              variables: { qty, defaultLng, defaultLat },
		              })
		           .pipe(
				           map((res) =>
				               {
					               return res.data.generateCustomers;
				               })
		           );
	}
	
	protected _customerFactory(customer: ICustomer)
	{
		return customer == null ? null : new Customer(customer);
	}
}
