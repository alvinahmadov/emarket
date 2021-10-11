import { Injectable }               from '@angular/core';
import { Apollo }                   from 'apollo-angular';
import { Observable }               from 'rxjs';
import { map }                      from 'rxjs/operators';
import IPagingOptions               from '@modules/server.common/interfaces/IPagingOptions';
import Order                        from '@modules/server.common/entities/Order';
import { IOrderCreateInput }        from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { GQLMutations, GQLQueries } from '@modules/server.common/utilities/graphql';

export interface IRemovedUserOrdersResponse
{
	num?: number
	modified?: number
}

@Injectable()
export class WarehouseOrdersService
{
	constructor(private readonly _apollo: Apollo) {}
	
	public createOrder(createInput: IOrderCreateInput): Observable<Order>
	{
		return this._apollo
		           .mutate({
			                   mutation:  GQLMutations.StoreOrdersMakeOrder,
			                   variables: { createInput },
		                   })
		           .pipe(map((result: any) => result.data['createOrder']));
	}
	
	public getStoreOrdersTableData(
			storeId: string,
			pagingOptions?: IPagingOptions,
			status?: string
	): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery({
			                       query:        GQLQueries.WarehouseOrdersTableData,
			                       pollInterval: 2000,
			                       variables:    { storeId, pagingOptions, status },
		                       })
		           .valueChanges.pipe(
						map((res) => res.data['getStoreOrdersTableData'])
				);
	}
	
	public async getCountOfStoreOrders(storeId: string, status?: string): Promise<number>
	{
		const res = await this._apollo
		                      .query({
			                             query:     GQLQueries.WarehouseOrdersCount,
			                             variables: { storeId, status },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfStoreOrders'];
	}
	
	public async removeCustomerOrders(storeId: string, customerId: string): Promise<IRemovedUserOrdersResponse>
	{
		const res = await this._apollo
		                      .query({
			                             query:     GQLQueries.WarehouseOrdersRemoveOrders,
			                             variables: { storeId, customerId },
		                             })
		                      .toPromise();
		
		return res.data['removeCustomerOrders'];
	}
	
	public async getOrdersInDelivery(storeId: string): Promise<Order[]>
	{
		const res = await this._apollo
		                      .query({
			                             query:     GQLQueries.WarehouseOrdersInDelivery,
			                             variables: { storeId },
		                             })
		                      .toPromise();
		
		return res.data['getOrdersInDelivery'];
	}
}
