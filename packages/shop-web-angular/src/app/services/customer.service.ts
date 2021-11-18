import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
import ICustomer,
{ ICustomerUpdateObject }        from '@modules/server.common/interfaces/ICustomer';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import Customer                  from '@modules/server.common/entities/Customer';
import {
	ICustomerLoginResponse,
	ICustomerRegistrationInput,
	IPasswordUpdateInput,
}                                from '@modules/server.common/routers/ICustomerAuthRouter';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation } from 'graphql/definitions';

export interface ICustomerMetrics
{
	totalOrders: number;
	canceledOrders: number;
	completedOrdersTotalSum: number;
}

@Injectable()
export class CustomersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Shop::CustomersService",
			      pollInterval: 10000
		      })
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
				           map((res) => <Customer>
						           this.factory(res, Customer)),
				           share()
		           );
	}
	
	public getCustomers(
			pagingOptions: IPagingOptions = {}
	): Observable<Customer[]>
	{
		return this.apollo
		           .watchQuery<{
			           customers: Customer[]
		           }>({
			              query:     GQLQuery.Customer.GetAll,
			              variables: { pagingOptions }
		              })
		           .valueChanges
		           .pipe(map((result) => <Customer[]>
				           this.factory(result, Customer)))
	}
	
	public login(
			authInfo: string,
			password: string,
			expiresIn?: string | number
	): Observable<ICustomerLoginResponse>
	{
		return this.apollo
		           .mutate<{
			           customerLoginInfo: ICustomerLoginResponse
		           }>({
			              mutation:  GQLMutation.Customer.Login,
			              variables: {
				              authInfo,
				              password,
				              expiresIn
			              },
		              })
		           .pipe(
				           map(result => this.get(result)),
				           share()
		           );
	}
	
	public async register(registerInput: ICustomerRegistrationInput): Promise<Customer>
	{
		return this.apollo
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
	
	public update(
			id: string,
			updateObject: ICustomerUpdateObject
	): Observable<Customer>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Customer.Update,
			                   variables: {
				                   id,
				                   updateObject
			                   }
		                   })
		           .pipe(map((result) => this.get(result)));
	}
	
	public updatePassword(
			id: string,
			passwordInput: IPasswordUpdateInput
	): Observable<Customer>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Customer.UpdatePassword,
			                   variables: {
				                   id,
				                   password: passwordInput
			                   }
		                   })
		           .pipe(map((result) => this.get(result)));
	}
	
	public isCustomerExists(conditions: {
		exceptCustomerId: string;
		memberKey: string;
		memberValue: string;
	}): Observable<boolean>
	{
		return this.apollo
		           .query<{
			           isCustomerExists: boolean
		           }>({
			              query:     GQLQuery.Customer.IsExists,
			              variables: { conditions },
		              })
		           .pipe(map((res) => this.get(res)));
	}
	
	public async getCustomerMetrics(
			id: string
	): Promise<ICustomerMetrics>
	{
		return this.apollo
		           .query<{
			           metrics: ICustomerMetrics
		           }>({
			              query:     GQLQuery.Customer.Metrics,
			              variables: { id },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
