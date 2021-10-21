import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import Order          from '@modules/server.common/entities/Order';
import Customer       from '@modules/server.common/entities/Customer';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

interface IOrderedCustomerInfo
{
	customer: Customer
	ordersCount: number
	totalPrice: number
}

@Injectable()
export class OrdersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName: "Merchant::OrdersService"
		      })
	}
	
	public getOrderedUsersInfo(storeId: string): Observable<IOrderedCustomerInfo[]>
	{
		return this.apollo
		           .watchQuery<{
			           info: IOrderedCustomerInfo[]
		           }>({
			              query:        GQLQuery.Order.GetOrderedUsersInfo,
			              variables:    { storeId },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getOrders(): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           orders: Order[]
		           }>({
			              query:        GQLQuery.Order.GetAll,
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
}
