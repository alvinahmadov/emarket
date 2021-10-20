import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map }                   from 'rxjs/operators';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import Order                     from '@modules/server.common/entities/Order';
import { IOrderCreateInput }     from '@modules/server.common/routers/IWarehouseOrdersRouter';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery } from 'graphql/definitions';

@Injectable()
export class WarehouseOrdersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  "Admin::WarehouseOrdersService",
			pollInterval: 5000
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
		           .pipe(map((result) => <Order>this.factory(result, Order)));
	}
	
	public getDashboardOrdersChartOrders(storeId: string): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           dashboardChartOrders: Order[]
		           }>({
			              query:     GQLQuery.Store.Order.GetDashboardChart,
			              variables: { storeId },
		              })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	public getStoreOrders(storeId: string): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           getStoreOrders: Order[]
		           }>({
			              query:        GQLQuery.Store.Order.GetById,
			              pollInterval: this.pollInterval,
			              variables:    { storeId },
		              })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	public getStoreOrdersTableData(
			storeId: string,
			pagingOptions?: IPagingOptions,
			status?: string
	): Observable<{ orders: Order[] }>
	{
		return this.apollo
		           .watchQuery({
			                       query:        GQLQuery.Store.Order.GetTableData,
			                       pollInterval: this.pollInterval,
			                       variables:    { storeId, pagingOptions, status },
		                       })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	public async getCountOfStoreOrders(storeId: string, status?: string): Promise<number>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Store.Order.GetCount,
			                  variables: { storeId, status },
		                  })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
