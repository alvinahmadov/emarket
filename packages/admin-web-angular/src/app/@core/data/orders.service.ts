import { Injectable }         from '@angular/core';
import { Apollo }             from 'apollo-angular';
import { ApolloQueryResult, } from 'apollo-client';
import { Observable }         from 'rxjs';
import { map, share }         from 'rxjs/operators';
import Order                  from '@modules/server.common/entities/Order';
import ApolloService          from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }           from 'graphql/definitions';

interface ICompletedOrderInfo
{
	totalOrders: number
	totalRevenue: number
}

interface IOrderCountTnfo
{
	id?: string
	ordersCount?: number
}

@Injectable()
export class OrdersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Admin::OrdersService",
			      pollInterval: 5000
		      });
	}
	
	public addOrdersToTake(): Observable<ApolloQueryResult<void>>
	{
		return this.apollo
		           .query({
			                  query: GQLQuery.Order.AddToTake,
		                  });
	}
	
	public addTakenOrders(carrierIds: string[]): Observable<ApolloQueryResult<void>>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Order.AddTaken,
			                  variables: { carrierIds },
		                  });
	}
	
	public generateRandomOrdersCurrentStore(
			storeId: string,
			storeCreatedAt: Date,
			ordersLimit: number
	): Observable<{ error: boolean; message: string }>
	{
		return this.apollo
		           .query<{
			           generateRandomOrdersCurrentStore: {
				           error: boolean;
				           message: string;
			           };
		           }>({
			              query:     GQLQuery.Order.GenerateRandomForCurrentStore,
			              variables: { storeId, storeCreatedAt, ordersLimit },
		              })
		           .pipe(map((result) => this.get(result)));
	}
	
	public getOrdersChartTotalOrders(): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           getOrdersChartTotalOrders: Order[]
		           }>({
			              query: GQLQuery.Order.GetChartTotal,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getOrdersChartTotalOrdersNew(): Promise<Order[]>
	{
		return this.apollo
		           .query({
			                  query: GQLQuery.Order.GetChartTotalIsCompleted,
		                  })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public getDashboardCompletedOrders(): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           getDashboardCompletedOrders: Order[]
		           }>({
			              query: GQLQuery.Order.GetDashboardCompleted,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getDashboardCompletedOrdersToday(): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           getDashboardCompletedOrdersToday: Order[]
		           }>({
			              query: GQLQuery.Order.GetDashboardCompletedToday,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getComplatedOrdersInfo(storeId?: string): Promise<ICompletedOrderInfo>
	{
		return this.apollo
		           .query<{
			           getCompletedOrdersInfo: ICompletedOrderInfo
		           }>({
			              query:     GQLQuery.Order.GetCompletedInfo,
			              variables: { storeId },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public getOrders(): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           orders: Order[]
		           }>({
			              query:        GQLQuery.Order.GetWithCustomer,
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getOrderById(id: string): Observable<Order | null>
	{
		return this.apollo
		           .watchQuery<{
			           order: Order
		           }>({
			              query:        GQLQuery.Order.GetById,
			              pollInterval: this.pollInterval,
			              variables:    { id },
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getCustomersOrdersCountInfo(usersIds?: string[]): Promise<IOrderCountTnfo[]>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Order.GetCustomersCountInfo,
			                  variables: { usersIds },
		                  })
		           .pipe(map((result) => this.get(result) || []))
		           .toPromise();
	}
	
	public async getMerchantsOrdersCountInfo(merchantsIds?: string[]): Promise<IOrderCountTnfo[]>
	{
		return this.apollo
		           .query<{
			           getMerchantsOrdersCountInfo: IOrderCountTnfo[]
		           }>({
			              query:     GQLQuery.Order.GetMerchantsCountInfo,
			              variables: { merchantsIds },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async getMerchantsOrders(): Promise<Order[]>
	{
		return this.apollo
		           .query<{
			           getMerchantsOrders: Order[]
		           }>({
			              query: GQLQuery.Order.GerMerchantsOrders,
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public generatePastOrdersPerCarrier(): Observable<ApolloQueryResult<void>>
	{
		return this.apollo
		           .query({
			                  query: GQLQuery.Order.GeneratePastPerCarrier,
		                  });
	}
	
	public generateActiveAndAvailableOrdersPerCarrier(): Observable<ApolloQueryResult<void>>
	{
		return this.apollo
		           .query({
			                  query: GQLQuery.Order.GenerateActiveAndAvailablePerCarrier,
		                  });
	}
}
