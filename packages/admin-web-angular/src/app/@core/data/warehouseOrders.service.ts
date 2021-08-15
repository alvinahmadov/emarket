import { Injectable }               from '@angular/core';
import { Apollo }                   from 'apollo-angular';
import { Observable }               from 'rxjs';
import { IOrderCreateInput }        from '@modules/server.common/routers/IWarehouseOrdersRouter';
import Order                        from '@modules/server.common/entities/Order';
import { map }                      from 'rxjs/operators';
import 'rxjs/add/operator/map';
import IPagingOptions               from '@modules/server.common/interfaces/IPagingOptions';
import { GQLMutations, GQLQueries } from '@modules/server.common/utilities';

@Injectable()
export class WarehouseOrdersService
{
	constructor(private readonly _apollo: Apollo) {}
	
	createOrder(createInput: IOrderCreateInput): Observable<Order>
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.OrderCreate,
			                   variables: { createInput },
		                   })
		           .pipe(map((result: any) => result.data.createOrder));
	}
	
	getDashboardOrdersChartOrders(storeId: string): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery<{
			           getDashboardOrdersChartOrders: Order[]
		           }>({
			              query: GQLQueries.OrderDashboardChartOrders,
			              variables: { storeId },
		              })
		           .valueChanges
		           .pipe(
				           map((res) => res.data.getDashboardOrdersChartOrders)
		           );
	}
	
	getStoreOrders(storeId: string): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery<{
			           getStoreOrders: Order[]
		           }>({
			              query: GQLQueries.OrderStoreOrders,
			              pollInterval: 5000,
			              variables: { storeId },
		              })
		           .valueChanges
		           .pipe(
				           map((res) => res.data.getStoreOrders)
		           );
	}
	
	getStoreOrdersTableData(
			storeId: string,
			pagingOptions?: IPagingOptions,
			status?: string
	): Observable<{ orders: Order[] }>
	{
		return this._apollo
		           .watchQuery({
			                       query: GQLQueries.OrderStoreOrdersTableData,
			                       pollInterval: 5000,
			                       variables: { storeId, pagingOptions, status },
		                       })
		           .valueChanges
		           .pipe(
				           map((res) => res.data['getStoreOrdersTableData'])
		           );
	}
	
	async getCountOfStoreOrders(storeId: string, status?: string)
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.OrderStoreOrdersCount,
			                             variables: { storeId, status },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfStoreOrders'];
	}
}
