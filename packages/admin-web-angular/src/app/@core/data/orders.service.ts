import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import Order          from '@modules/server.common/entities/Order';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class OrdersService
{
	constructor(private readonly _apollo: Apollo) {}
	
	generatePastOrdersPerCarrier()
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.OrderPastGeneratePerCarrier,
		                  });
	}
	
	generateActiveAndAvailableOrdersPerCarrier()
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.OrderGenerateActiveAndAvailablePerCarrier,
		                  });
	}
	
	addOrdersToTake(): Observable<any>
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.OrderAddToTake,
		                  });
	}
	
	addTakenOrders(carrierIds: string[]): Observable<any>
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.OrderAddTaken,
			                  variables: { carrierIds },
		                  });
	}
	
	generateRandomOrdersCurrentStore(
			storeId: string,
			storeCreatedAt: Date,
			ordersLimit: number
	): Observable<{ error: boolean; message: string }>
	{
		return this._apollo
		           .query<{
			           generateRandomOrdersCurrentStore: {
				           error: boolean;
				           message: string;
			           };
		           }>({
			              query: GQLQueries.OrderGenerateRandomCurrentStore,
			              variables: { storeId, storeCreatedAt, ordersLimit },
		              })
		           .pipe(map((res) => res.data.generateRandomOrdersCurrentStore));
	}
	
	getOrdersChartTotalOrders(): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery<{
			           getOrdersChartTotalOrders: Order[]
		           }>({
			              // no needed
			              // isCompleted
			              query: GQLQueries.OrderChartTotalOrders,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.getOrdersChartTotalOrders),
						share()
				);
	}
	
	async getOrdersChartTotalOrdersNew()
	{
		const res = await this._apollo
		                      .query<{
			                      getOrdersChartTotalOrders: Order[];
		                      }>({
			                         query: GQLQueries.OrderChartTotalOrdersIsCompleted,
		                         })
		                      .toPromise();
		return res.data.getOrdersChartTotalOrders;
	}
	
	getDashboardCompletedOrders(): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery<{
			           getDashboardCompletedOrders: Order[]
		           }>({
			              query: GQLQueries.OrderDashboardCompleted,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.getDashboardCompletedOrders),
						share()
				);
	}
	
	async getComplatedOrdersInfo(storeId?: string)
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.OrderCompletedInfo,
			                             variables: { storeId },
		                             })
		                      .toPromise();
		
		return res.data['getCompletedOrdersInfo'];
	}
	
	getDashboardCompletedOrdersToday(): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery<{
			           getDashboardCompletedOrdersToday: Order[]
		           }>({
			              query: GQLQueries.OrderDashboardCompletedToday,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.getDashboardCompletedOrdersToday),
						share()
				);
	}
	
	getOrders(): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery<{
			           orders: Order[]
		           }>({
			              query: GQLQueries.OrderDetails,
			              pollInterval: 4000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.orders),
						share()
				);
	}
	
	getOrderById(id: string)
	{
		return this._apollo
		           .watchQuery({
			                       query: GQLQueries.OrderById,
			                       pollInterval: 4000,
			                       variables: { id },
		                       })
		           .valueChanges
		           .pipe(
				           map((res) => res.data['getOrder']),
				           share()
		           );
	}
	
	async getUsersOrdersCountInfo(usersIds?: string[])
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.OrderUsersCountInfo,
			                             variables: { usersIds },
		                             })
		                      .toPromise();
		
		return res.data['getUsersOrdersCountInfo'];
	}
	
	async getMerchantsOrdersCountInfo(merchantsIds?: string[])
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.OrderMerchantsCountInfo,
			                             variables: { merchantsIds },
		                             })
		                      .toPromise();
		
		return res.data['getMerchantsOrdersCountInfo'];
	}
	
	async getMerchantsOrders()
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.OrderMerchants,
		                             })
		                      .toPromise();
		
		return res.data['getMerchantsOrders'];
	}
	
	protected _orderFactory(order: Order)
	{
		return order == null ? null : new Order(order);
	}
}
