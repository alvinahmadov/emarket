import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map }                   from 'rxjs/operators';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import Order                     from '@modules/server.common/entities/Order';
import { IOrderCreateInput }     from '@modules/server.common/routers/IWarehouseOrdersRouter';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery } from 'graphql/definitions';

export interface IRemovedCustomerOrdersResponse
{
	num?: number
	modified?: number
}

@Injectable()
export class WarehouseOrdersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Merchant::WarehouseOrdersService",
			      pollInterval: 2000
		      });
	}
	
	public createOrder(createInput: IOrderCreateInput): Observable<Order>
	{
		return this.apollo
		           .mutate<{
			           order: IOrderCreateInput
		           }>({
			              mutation:  GQLMutation.Store.Order.Create,
			              variables: { createInput },
		              })
		           .pipe(map((result) => <Order>this.get(result)));
	}
	
	public getStoreOrdersTableData(
			storeId: string,
			pagingOptions?: IPagingOptions,
			status?: string
	): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery({
			                       query:        GQLQuery.Store.Order.GetTableData,
			                       pollInterval: this.pollInterval,
			                       variables:    { storeId, pagingOptions, status },
		                       })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result))
		           );
	}
	
	public async getCountOfStoreOrders(storeId: string, status?: string): Promise<number>
	{
		return this.apollo
		           .query<{
			           ordersCount: number
		           }>({
			              query:     GQLQuery.Store.Order.Count,
			              variables: { storeId, status },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async removeCustomerOrders(
			storeId: string,
			customerId: string
	): Promise<IRemovedCustomerOrdersResponse>
	{
		return this.apollo
		           .query<{
			           removedCustomerOrders?: IRemovedCustomerOrdersResponse
		           }>({
			              query:     GQLQuery.Store.Order.Remove,
			              variables: { storeId, customerId },
		              })
		           .pipe(map((result) => this.get(result) || {}))
		           .toPromise();
	}
	
	public async getOrdersInDelivery(storeId: string): Promise<Order[]>
	{
		return this.apollo
		           .query<{
			           ordersInDelivery: Order[]
		           }>
		           ({
			            query:     GQLQuery.Store.Order.GetInDelivery,
			            variables: { storeId },
		            })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
