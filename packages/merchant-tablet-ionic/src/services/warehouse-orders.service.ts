import { Injectable }               from '@angular/core';
import { Apollo }                   from 'apollo-angular';
import { Observable }               from 'rxjs';
import { IOrderCreateInput }        from '@modules/server.common/routers/IWarehouseOrdersRouter';
import Order                        from '@modules/server.common/entities/Order';
import { map }                      from 'rxjs/operators';
import IPagingOptions               from '@modules/server.common/interfaces/IPagingOptions';
import { GQLMutations, GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class WarehouseOrdersService
{
	constructor(private readonly _apollo: Apollo)
	{ }
	
	createOrder(createInput: IOrderCreateInput): Observable<Order>
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.StoreOrdersMakeOrder,
			                   variables: { createInput },
		                   })
		           .pipe(map((result: any) => result.data.createOrder));
	}
	
	getStoreOrdersTableData(
			storeId: string,
			pagingOptions?: IPagingOptions,
			status?: string
	): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery({
			                       query: GQLQueries.StoreOrdersTableData,
			                       pollInterval: 2000,
			                       variables: { storeId, pagingOptions, status },
		                       })
		           .valueChanges.pipe(
						map((res) => res.data['getStoreOrdersTableData'])
				);
	}
	
	async getCountOfStoreOrders(storeId: string, status?: string)
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.StoreOrdersCount,
			                             variables: { storeId, status },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfStoreOrders'];
	}
	
	async removeUserOrders(storeId: string, userId: string)
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.StoreOrdersRemoveOrders,
			                             variables: { storeId, userId },
		                             })
		                      .toPromise();
		
		return res.data['removeUserOrders'];
	}
	
	async getOrdersInDelivery(storeId: string)
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.OrdersInDelivery,
			                             variables: { storeId },
		                             })
		                      .toPromise();
		
		return res.data['getOrdersInDelivery'];
	}
}
