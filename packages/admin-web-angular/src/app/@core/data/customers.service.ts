import { Injectable }                            from '@angular/core';
import { Apollo }                                from 'apollo-angular';
import { FetchResult }                           from 'apollo-link';
import { Observable }                            from 'rxjs';
import { map, share }                            from 'rxjs/operators';
import ICustomer, { IResponseGenerateCustomers } from '@modules/server.common/interfaces/ICustomer';
import IPagingOptions                            from '@modules/server.common/interfaces/IPagingOptions';
import Customer                                  from '@modules/server.common/entities/Customer';
import { ICustomerRegistrationInput }            from '@modules/server.common/routers/ICustomerAuthRouter';
import { ICustomerMemberInput }                  from '@modules/server.common/routers/ICustomerRouter';
import ApolloService                             from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery }                 from 'graphql/definitions';
import { ICustomerOrderMetrics } from '@modules/server.common/interfaces/ICustomerOrder';

@Injectable()
export class CustomersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName: "Admin::CustomersService"
		      });
	}
	
	public isCustomerEmailExists(email: string): Promise<boolean>
	{
		return this.apollo
		           .query<{
			           isCustomerEmailExists: boolean
		           }>({
			              query:     GQLQuery.Customer.IsEmailExists,
			              variables: { email },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public isCustomerExists(conditions: ICustomerMemberInput): Observable<boolean>
	{
		return this.apollo
		           .query<{
			           isCustomerExists: boolean
		           }>({
			              query:     GQLQuery.Customer.IsExists,
			              variables: { conditions },
		              })
		           .pipe(map((result) => this.get(result)));
	}
	
	public getCustomers(pagingOptions?: IPagingOptions): Observable<Customer[]>
	{
		return this.apollo
		           .watchQuery<{
			           customers: ICustomer[]
		           }>(
				           {
					           query:        GQLQuery.Customer.GetAllWithPaging,
					           variables:    { pagingOptions },
					           pollInterval: this.pollInterval,
				           }
		           )
		           .valueChanges
		           .pipe(
				           map((result) => <Customer[]>
						           this.factory(result, Customer)),
				           share()
		           );
	}
	
	public getCustomerById(id: string): Observable<Customer>
	{
		return this.apollo
		           .query<{
			           customer: ICustomer
		           }>({
			              query:     GQLQuery.Customer.GetById,
			              variables: { id },
		              })
		           .pipe(
				           map((result) => <Customer>
						           this.factory(result, Customer)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<FetchResult<string>>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Customer.RemoveByIds,
			                   variables: { ids },
		                   });
	}
	
	public async registerCustomer(registerInput: ICustomerRegistrationInput): Promise<Customer>
	{
		return await this.apollo
		                 .mutate<{
			                 customer: ICustomer
		                 }>({
			                    mutation:  GQLMutation.Customer.Register,
			                    variables: { registerInput },
		                    })
		                 .pipe(
				                 map((result) => <Customer>
						                 this.factory(result, Customer)),
				                 share()
		                 )
		                 .toPromise();
		
	}
	
	public async banCustomer(id: string): Promise<Customer | null>
	{
		return this.apollo
		           .mutate<{
			           customer: Customer | null
		           }>({
			              mutation:  GQLMutation.Customer.Ban,
			              variables: { id },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async unbanCustomer(id: string): Promise<Customer | null>
	{
		return this.apollo
		           .mutate<{
			           customer: Customer | null
		           }>({
			              mutation:  GQLMutation.Customer.Unban,
			              variables: { id },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           )
		           .toPromise();
	}
	
	public async getCountOfCustomers(): Promise<number>
	{
		return await this.apollo
		                 .query<{
			                 count: number
		                 }>({
			                    query: GQLQuery.Customer.Count,
		                    })
		                 .pipe(map((result) => this.get(result)))
		                 .toPromise();
	}
	
	public async getCustomerMetrics(
			id: string
	): Promise<ICustomerOrderMetrics>
	{
		return await this.apollo
		                 .query<{
			                 metrics: ICustomerOrderMetrics
		                 }>({
			                    query:     GQLQuery.Customer.Metrics,
			                    variables: { id },
		                    })
		                 .pipe(map((result) => this.get(result)))
		                 .toPromise();
	}
	
	public generateCustomCustomers(
			qty: number = 1000,
			defaultLng: number,
			defaultLat: number
	): Observable<IResponseGenerateCustomers>
	{
		return this.apollo
		           .query<{
			           generateCustomers: IResponseGenerateCustomers
		           }>({
			              query:     GQLQuery.Customer.GenerateFakeCustomers,
			              variables: { qty, defaultLng, defaultLat },
		              })
		           .pipe(map((result) => this.get(result)));
	}
}
